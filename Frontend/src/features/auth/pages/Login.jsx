import React, { useState } from "react";
import "../auth.form.scss";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import Loading from "../../../components/Loading/Loading";

const Login = () => {
  const { loading, handleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin({ email, password });
    navigate("/");
  };

  if (loading) {
    return <Loading message="Signing you in..." />;
  }

  return (
    <main>
      <header className="page-header">
        <h1>
          Create Your Custom <span className="highlight">Interview Plan</span>
        </h1>
        <p>
          Let our AI analyze the job requirements and your unique profile to
          build a winning strategy.
        </p>
      </header>
      <div className="from-container">
        <h1>Login</h1>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              type="email"
              id="email"
              name="email"
              placeholder="Enter email address"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              type="password"
              id="password"
              name="password"
              placeholder="Enter password"
            />
          </div>

          <button className="button primary-button">Login</button>
        </form>

        <p>
          Don't have an account? <Link to={"/register"}>Register</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
