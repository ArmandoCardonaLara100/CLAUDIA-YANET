import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      username: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    username: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    username: string;
  }
}

// The JWT interface actually originates in @auth/core/jwt (next-auth/jwt
// re-exports it), so augment it there too for the callback token type.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    username: string;
  }
}
