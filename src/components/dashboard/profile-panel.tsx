"use client";

import { useState, useRef } from "react";
import {
  User,
  Camera,
  X,
  Save,
  Mail,
  AtSign,
  MapPin,
  Building,
  Trash2,
  LogOut,
  KeyRound,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface ProfilePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onAvatarUpload: (file: File) => void;
  onAvatarRemove: () => void;
  onLogout: () => void;
}

export function ProfilePanel({
  open,
  onOpenChange,
  user,
  onUpdateProfile,
  onAvatarUpload,
  onAvatarRemove,
  onLogout,
}: ProfilePanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile> & { oldPassword?: string; newPassword?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = () => {
    setFormData({
      name: user.name,
      email: user.email,
      oldPassword: "",
      newPassword: "",
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({});
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAvatarUpload(file);
    }
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="glass-panel border-l-glass-border sm:max-w-md p-0 overflow-hidden flex flex-col h-full w-[85vw] sm:w-full">
        {/* Header with gradient */}
        <div className="relative h-28 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent">
          
          {/* Avatar overlapping header */}
          <div className="absolute -bottom-12 left-6">
            <div className="relative group">
              <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
                <AvatarFallback className="bg-secondary text-foreground text-2xl font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              {/* Avatar overlay on hover */}
              <button
                onClick={handleAvatarClick}
                className={cn(
                  "absolute inset-0 rounded-full bg-background/80 backdrop-blur-sm",
                  "flex items-center justify-center opacity-0 group-hover:opacity-100",
                  "transition-opacity cursor-pointer"
                )}
              >
                <Camera className="w-6 h-6 text-foreground" />
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <SheetHeader className="px-6 pt-14 pb-0 text-left">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl">{user.name}</SheetTitle>
            </div>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="bg-secondary/50 border-border/50 hover:bg-secondary"
              >
                Edit Profil
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="text-muted-foreground"
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Simpan
                </Button>
              </div>
            )}
          </div>
        </SheetHeader>

        <div className="px-6 py-6 space-y-6 overflow-y-auto flex-1">
          {/* Profile Fields */}
          <div className="space-y-4">
            <ProfileField
              icon={User}
              label="Nama Lengkap"
              value={user.name}
              isEditing={isEditing}
              editValue={formData.name}
              onEditChange={(v) => setFormData((p) => ({ ...p, name: v }))}
            />
            <ProfileField
              icon={Mail}
              label="Email"
              value={user.email}
              isEditing={isEditing}
              editValue={formData.email}
              onEditChange={(v) => setFormData((p) => ({ ...p, email: v }))}
              type="email"
            />
            {isEditing && (
              <>
                <ProfileField
                  icon={KeyRound}
                  label="Password Lama (opsional)"
                  value="********"
                  isEditing={isEditing}
                  editValue={formData.oldPassword}
                  onEditChange={(v) => setFormData((p) => ({ ...p, oldPassword: v }))}
                  type="password"
                  placeholder="Masukkan password lama"
                />
                <ProfileField
                  icon={KeyRound}
                  label="Password Baru (opsional)"
                  value="********"
                  isEditing={isEditing}
                  editValue={formData.newPassword}
                  onEditChange={(v) => setFormData((p) => ({ ...p, newPassword: v }))}
                  type="password"
                  placeholder="Masukkan password baru"
                />
              </>
            )}
          </div>

          <Separator className="bg-border/30" />

          {/* Avatar Actions */}
          {user.avatarUrl && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Foto Profil</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Hapus foto profil Anda
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAvatarRemove}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 border-border/50"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Hapus
                </Button>
              </div>
              <Separator className="bg-border/30" />
            </>
          )}

          {/* Logout */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Keluar</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Logout dari akun Anda
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 border-border/50"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Keluar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ProfileField({
  icon: Icon,
  label,
  value,
  isEditing,
  editValue,
  onEditChange,
  type = "text",
  placeholder,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  isEditing: boolean;
  editValue?: string;
  onEditChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {isEditing ? (
          <Input
            type={type}
            value={editValue || ""}
            onChange={(e) => onEditChange(e.target.value)}
            placeholder={placeholder}
            className="mt-1 h-9 bg-secondary/50 border-border/50"
          />
        ) : (
          <p className={cn(
            "text-sm mt-0.5 truncate",
            !value || value === "Belum diatur" ? "text-muted-foreground/60" : ""
          )}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
