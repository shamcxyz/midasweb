import os
import tempfile
import zipfile
from datetime import datetime
from typing import List, Dict, Union
from fastapi import FastAPI, HTTPException, Form, File, UploadFile, status
from dotenv import load_dotenv
from openai import OpenAI
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from docx import Document
import PyPDF2
import base64
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

client = OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI(title="Reimbursement Request System")

class MultiFileProcessor:
    ALLOWED_EXTENSIONS = {'.docx', '.pdf', '.jpg', '.jpeg', '.png', '.zip'}
    IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png'}
    
    @staticmethod
    def get_file_extension(filename: str) -> str:
        return os.path.splitext(filename)[1].lower()
    
    @staticmethod
    def encode_image(image_path: str) -> str:
        try:
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            logger.error(f"Error encoding image: {str(e)}")
            raise ValueError(f"Error encoding image: {str(e)}")

    @staticmethod
    def extract_text_from_pdf(pdf_path: str) -> str:
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                content = []
                
                for page in reader.pages:
                    content.append(page.extract_text())
                    
                text = "\n\n=== Page Break ===\n\n".join(content)
                
                lines = text.split('\n')
                formatted_lines = []
                for line in lines:
                    if '\t' in line or '    ' in line:
                        items = [item.strip() for item in line.split('\t') if item.strip()]
                        if not items:
                            items = [item.strip() for item in line.split('    ') if item.strip()]
                        if items:
                            formatted_lines.append('\t'.join(items))
                    else:
                        formatted_lines.append(line)
                        
                return '\n'.join(formatted_lines)
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise ValueError(f"Error extracting text from PDF: {str(e)}")

    @staticmethod
    def extract_text_from_docx(file_path: str) -> str:
        try:
            with open(file_path, 'rb') as file:
                doc = Document(file)
                content = []
                
                for para in doc.paragraphs:
                    if para.text.strip():
                        content.append(para.text.strip())
                
                for table in doc.tables:
                    table_content = []
                    for row in table.rows:
                        row_content = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                        if row_content:
                            table_content.append('\t'.join(row_content))
                    if table_content:
                        content.append('\n'.join(table_content))
                
                return '\n\n'.join(content)
        except Exception as e:
            logger.error(f"Error extracting text from DOCX: {str(e)}")
            raise ValueError(f"Error extracting text from DOCX: {str(e)}")
    
    @staticmethod
    async def save_upload_file(upload_file: UploadFile) -> str:
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(upload_file.filename)[1]) as tmp_file:
                content = await upload_file.read()
                tmp_file.write(content)
                return tmp_file.name
        except Exception as e:
            logger.error(f"Error saving uploaded file: {str(e)}")
            raise ValueError(f"Error saving uploaded file: {str(e)}")
    
    @staticmethod
    def process_zip(zip_path: str) -> List[Dict[str, Union[str, bool]]]:
        processed_files = []
        try:
            with tempfile.TemporaryDirectory() as tmp_dir:
                with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                    zip_ref.extractall(tmp_dir)
                    
                    for root, _, files in os.walk(tmp_dir):
                        for file in files:
                            file_path = os.path.join(root, file)
                            ext = MultiFileProcessor.get_file_extension(file)
                            
                            if ext in MultiFileProcessor.ALLOWED_EXTENSIONS and ext != '.zip':
                                try:
                                    processed_content = MultiFileProcessor.process_single_file(file_path)
                                    processed_files.append(processed_content)
                                except Exception as e:
                                    logger.error(f"Error processing file {file} in zip: {str(e)}")
                                    continue
            
            return processed_files
        except Exception as e:
            logger.error(f"Error processing zip file: {str(e)}")
            raise ValueError(f"Error processing zip file: {str(e)}")
    
    @staticmethod
    def process_single_file(file_path: str) -> Dict[str, Union[str, bool]]:
        ext = MultiFileProcessor.get_file_extension(file_path)
        
        try:
            if ext == '.docx':
                return {
                    'content': MultiFileProcessor.extract_text_from_docx(file_path),
                    'is_image': False
                }
            elif ext == '.pdf':
                return {
                    'content': MultiFileProcessor.extract_text_from_pdf(file_path),
                    'is_image': False
                }
            elif ext in MultiFileProcessor.IMAGE_EXTENSIONS:
                return {
                    'content': MultiFileProcessor.encode_image(file_path),
                    'is_image': True
                }
            else:
                raise ValueError(f"Unsupported file type: {ext}")
        except Exception as e:
            logger.error(f"Error processing file {file_path}: {str(e)}")
            raise ValueError(f"Error processing file {file_path}: {str(e)}")

async def analyze_with_gpt4o(content: str, is_image: bool = False) -> str:
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    try:
        if is_image:
            messages = [
                {"role": "system", "content": "You are an assistant helping with reimbursement requests. Analyze the receipt image and decide whether to 'Approve' or 'Reject' the request."},
                {"role": "user", "content": [
                    {"type": "text", "text": f"Today is {current_date}. Please analyze this receipt image:"},
                    {"type": "image_url", "image_url": {
                        "url": f"data:image/jpeg;base64,{content}"
                    }}
                ]}
            ]
        else:
            messages = [
                {"role": "system", "content": "You are an assistant helping with reimbursement requests. Analyze the document and decide whether to 'Approve' or 'Reject' the request."},
                {"role": "user", "content": f"Today is {current_date}. Here is the document content:\n\n{content}"}
            ]
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages
        )
        
        return response.choices[0].message.content
            
    except Exception as e:
        logger.error(f"Error analyzing content: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing content: {str(e)}"
        )

async def send_email(name: str, user_email: str, admin_email: str, details: str, 
                    decision_text: str, file_paths: List[str], is_approved: bool):
    msg = MIMEMultipart()
    msg["From"] = EMAIL_USER
    msg["Subject"] = "Reimbursement Request Decision"
    
    if is_approved:
        msg["To"] = admin_email
        msg["Cc"] = user_email
        body = (f"Reimbursement request from {name} ({user_email}) has been APPROVED.\n\n"
                f"Details:\n{details}\n\nDecision Summary:\n{decision_text}")
    else:
        msg["To"] = user_email
        body = (f"Dear {name},\n\nYour reimbursement request has been REJECTED.\n\n"
                f"Reason:\n{decision_text}\n\nPlease contact your administrator for more details.")
    
    msg.attach(MIMEText(body, "plain"))
    
    for file_path in file_paths:
        try:
            with open(file_path, "rb") as f:
                attachment = MIMEApplication(f.read(), Name=os.path.basename(file_path))
                attachment["Content-Disposition"] = f'attachment; filename="{os.path.basename(file_path)}"'
                msg.attach(attachment)
        except Exception as e:
            logger.error(f"Error attaching file {file_path}: {str(e)}")
            continue
    
    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )

@app.post("/api/request_reimbursement")
async def request_reimbursement(
    role: str = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    admin_email: str = Form(...),
    reimbursement_details: str = Form(...),
    files: List[UploadFile] = File(...)
):
    if role.lower() != "user":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be 'user'."
        )
    
    processor = MultiFileProcessor()
    temp_files = []
    all_content = []
    
    try:
        for file in files:
            ext = processor.get_file_extension(file.filename)
            if ext not in processor.ALLOWED_EXTENSIONS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Unsupported file type: {ext}"
                )
            
            temp_file_path = await processor.save_upload_file(file)
            temp_files.append(temp_file_path)
            
            if ext == '.zip':
                zip_contents = processor.process_zip(temp_file_path)
                all_content.extend(zip_contents)
            else:
                processed_content = processor.process_single_file(temp_file_path)
                all_content.append(processed_content)
        
        combined_analysis = ""
        for content_item in all_content:
            analysis = await analyze_with_gpt4o(
                content_item['content'],
                is_image=content_item.get('is_image', False)
            )
            combined_analysis += f"\n\n{analysis}"
        
        is_approved = "approve" in combined_analysis.lower()
        decision = "Approved" if is_approved else "Rejected"
        
        await send_email(
            name, email, admin_email, reimbursement_details,
            combined_analysis, temp_files, is_approved
        )
        
        return {
            "status": decision,
            "feedback": combined_analysis,
            "processed_files": len(all_content)
        }
        
    except Exception as e:
        logger.error(f"Error in request_reimbursement: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing request: {str(e)}"
        )
    finally:
        for temp_file in temp_files:
            if os.path.exists(temp_file):
                os.remove(temp_file)