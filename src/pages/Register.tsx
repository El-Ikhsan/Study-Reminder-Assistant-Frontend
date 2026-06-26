import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, User } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/register", { name, email, password });

      if (response.data.success) {
        setSuccess("Registrasi berhasil! Mengarahkan ke halaman login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(response.data.message || "Gagal melakukan registrasi.");
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
          <h1 className="text-2xl font-bold text-foreground">Buat Akun Study Reminder Assistant</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Mulai kelola IoT dan fokus belajar Anda
          </p>
        </div>

        <div className="glass-panel p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-lg bg-success/10 border border-success/30 text-success text-sm">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nama Anda"
                  className="pl-10 bg-secondary/50 border-border/50"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onInvalid={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.validity.valueMissing) {
                      target.setCustomValidity("Harap masukkan nama lengkap Anda.");
                    }
                  }}
                  onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
                  required
                />
              </div>
            </div>

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
                  minLength={8}
                  onInvalid={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.validity.valueMissing) {
                      target.setCustomValidity("Harap masukkan password Anda.");
                    } else if (target.validity.tooShort) {
                      target.setCustomValidity("Harap gunakan minimal 8 karakter untuk password.");
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
              disabled={isLoading || !!success}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {isLoading ? "Memproses..." : "Register"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Login di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
