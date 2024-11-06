import { useState } from "react";
import Link from "next/link";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; // Ensure Firebase is initialized in your app

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect or show success message
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  return (
    <section>
      {/* UI code remains the same... */}
      <form className="mx-auto max-w-[400px]" onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input w-full"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input w-full"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-6 space-y-5">
          <button type="submit" className="btn w-full">Sign in</button>
        </div>
        {error && <p className="text-red-500 text-center">{error}</p>}
      </form>
      {/* Rest of the UI code... */}
    </section>
  );
}
