"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, User, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { cerrarSesion } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  userEmail: string | null;
  isAdmin: boolean;
}

export function UserMenu({ userEmail, isAdmin }: UserMenuProps) {
  if (!userEmail) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Iniciar sesión"
        className="text-muted-foreground"
        render={<Link href="/auth/login" />}
        nativeButton={false}
      >
        <User />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Mi cuenta"
            className="text-muted-foreground"
          />
        }
      >
        <UserCircle />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="max-w-[200px] truncate font-normal">
            {userEmail}
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        {isAdmin && (
          <>
            <DropdownMenuItem render={<Link href="/admin" />}>
              <LayoutDashboard className="size-4" />
              Panel admin
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem
          onClick={async () => {
            try {
              await cerrarSesion();
            } catch (error) {
              // El `redirect` de la Server Action no debe tratarse como error.
              if (isRedirectError(error)) throw error;
              toast.error("No se pudo cerrar la sesión", {
                description: "Intentá de nuevo en unos minutos.",
              });
            }
          }}
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}