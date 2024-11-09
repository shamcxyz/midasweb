import os
import tempfile
from datetime import datetime
from fastapi import FastAPI, HTTPException, Form, File, UploadFile, status
from dotenv import load_dotenv
import openai
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from docx import Document

# Load environment variables from .env file
load_dotenv()

# Set OpenAI API key and email credentials
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

# Initialize OpenAI API key
openai.api_key = OPENAI_API_KEY

# Initialize FastAPI application
app = FastAPI()

# Function to extract text and tables from a .docx file
def extract_text_from_docx(file_path):
    document = Document(file_path)
    content = []

    # Extract text outside tables
    for para in document.paragraphs:
        if para.text.strip():
            content.append(para.text.strip())

    # Extract tables with structure
    for table in document.tables:
        table_data = []
        for row in table.rows:
            row_data = [cell.text.strip() for cell in row.cells]
            table_data.append(row_data)
        # Join rows with tabs and add as one item
        formatted_table = "\n".join(["\t".join(row) for row in table_data])
        content.append(formatted_table)

    full_content = "\n".join(content)
    print("DEBUG - Extracted structured content:", full_content)  # Debugging print
    return full_content

# Function to send an email based on approval status
def send_email(name, user_email, admin_email, details, decision_text, receipt_path, is_approved):
    msg = MIMEMultipart()
    msg["From"] = EMAIL_USER
    msg["Subject"] = "Reimbursement Request Decision"

    if is_approved:
        msg["To"] = admin_email
        msg["Cc"] = user_email
        body = f"Reimbursement request from {name} ({user_email}) has been APPROVED.\n\nDetails:\n{details}\n\nDecision Summary:\n{decision_text}"
    else:
        msg["To"] = user_email
        body = f"Dear {name},\n\nYour reimbursement request for '{details}' has been REJECTED.\n\nReason:\n{decision_text}\n\nPlease contact your administrator for more details."

    msg.attach(MIMEText(body, "plain"))

    # Attach the actual .docx file to the email
    with open(receipt_path, "rb") as f:
        attachment = MIMEApplication(f.read(), Name=os.path.basename(receipt_path))
        attachment["Content-Disposition"] = f'attachment; filename="{os.path.basename(receipt_path)}"'
        msg.attach(attachment)

    # Send the email using SMTP
    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to send email: {str(e)}")

@app.post("/request_reimbursement")
async def request_reimbursement(
    role: str = Form(..., example="user"),
    name: str = Form(..., example="Joe"),
    email: str = Form(..., example="email@example.com"),
    admin_email: str = Form(..., example="admin@example.com"),
    reimbursement_details: str = Form(..., example="Conference travel expenses"),
    receipt: UploadFile = File(...)
):
    # Validate role
    if role.lower() != "user":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role must be 'user'.")

    # Validate receipt file extension
    if not receipt.filename.endswith(".docx"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Receipt file must be a .docx file.")

    # Save the uploaded file to a temporary location
    with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp_file:
        tmp_file.write(await receipt.read())
        tmp_file_path = tmp_file.name

    try:
        # Extract structured text from .docx file
        receipt_content = extract_text_from_docx(tmp_file_path)
        if not receipt_content:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to extract content from .docx file.")

        print("DEBUG - Sending structured content to LLM:", receipt_content)

        # Use the LLM to summarize and decide on approval status
        current_date = datetime.now().strftime("%Y-%m-%d")
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an assistant helping with reimbursement requests. Summarize the document and explicitly decide whether to 'Approve' or 'Reject' the request based on the provided information and guidelines."},
                {"role": "user", "content": f"Today is {current_date}. Here is the document content:\n\n{receipt_content}\n\nDoes this meet the criteria for reimbursement?"}
            ]
        )

        # Get the decision text and check for approval or rejection
        decision_text = response['choices'][0]['message']['content'].strip()
        is_approved = "approve" in decision_text.lower()  # Check for 'approve' keyword to determine status
        decision = "Approved" if is_approved else "Rejected"

        # Send email based on approval status
        send_email(name, email, admin_email, reimbursement_details, decision_text, tmp_file_path, is_approved)

        return {"status": decision, "feedback": decision_text}

    except openai.error.OpenAIError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error with OpenAI: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Unexpected error: {str(e)}")
    finally:
        # Remove the temporary file
        if os.path.exists(tmp_file_path):
            os.remove(tmp_file_path)