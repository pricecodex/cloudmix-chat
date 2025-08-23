"use client";

import { AuthorizeSessionDto } from "@/entities/session/dtos/authorize-session.dto";

function useSession() {
  const KEY = "loginData";

  function set(data: AuthorizeSessionDto) {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function remove() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(KEY);
  }

  function get() {
    if (typeof window === "undefined") return;
    const value = localStorage.getItem(KEY);
    if (!value) {
      return null;
    }
    return JSON.parse(value) as AuthorizeSessionDto;
  }

  function getOrFail() {
    if (typeof window === "undefined") return {} as AuthorizeSessionDto;
    const session = get();

    if (!session) {
      throw new Error("Getting a non existing session");
    }

    return session;
  }

  function getUsername() {
    const { username } = getOrFail();

    return username;
  }

  return {
    getOrFail,
    get,
    set,
    getUsername,
    remove,
  };
}

export default useSession;
