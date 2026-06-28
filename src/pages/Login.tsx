import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock } from "lucide-react";
import { api, setTokens } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });

      if (response.data.success) {
        const { user, tokens } = response.data.data;
        // Save tokens to cookies
        setTokens(tokens.accessToken, tokens.refreshToken);

        // Update context
        login(user);

        // Redirect to dashboard
        navigate("/");
      } else {
        setError(response.data.message || "Gagal melakukan login.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Terjadi kesalahan pada server. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-19 h-15 flex items-center justify-center mb-4">
            <img src="/onigiri-logo.png" alt="" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Study Reminder Assistant</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Login untuk mengakses dashboard IoT Anda
          </p>
        </div>

        <div className="glass-panel p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@email.com"
                  className="pl-10 bg-secondary/50 border-border/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onInvalid={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.validity.valueMissing) {
                      target.setCustomValidity("Harap masukkan alamat email Anda.");
                    } else if (target.validity.typeMismatch) {
                      target.setCustomValidity("Harap sertakan '@' pada alamat email.");
                    }
                  }}
                  onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-secondary/50 border-border/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onInvalid={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.validity.valueMissing) {
                      target.setCustomValidity("Harap masukkan password Anda.");
                    }
                  }}
                  onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isLoading ? "Memproses..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Register sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
