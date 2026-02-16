import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Login({ setSession }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    }
  };

  const register = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      await supabase.from("profiles").insert([
        {
          id: data.user.id,
          role: "user",
        },
      ]);

      alert("Registrasi berhasil. Silakan login.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Login Pembukuan PRO 2.0
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full bg-blue-600 text-white py-2 rounded mb-2"
        >
          Login
        </button>

        <button
          onClick={register}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Register
        </button>
      </div>
    </div>
  );
}