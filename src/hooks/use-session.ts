import { AuthorizeSessionDto } from "@/entities/session/dtos/authorize-session.dto";

function useSession() {
  const KEY = "login-data";

  function set(data: AuthorizeSessionDto) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function get() {
    const value = localStorage.getItem(KEY);
    if (!value) {
      return null;
    }
    return JSON.parse(value) as AuthorizeSessionDto;
  }

  function getOrFail() {
    const session = get();

    if (!session) {
      throw new Error("Getting a non existing session");
    }

    return session;
  }

  return {
    getOrFail,
    get,
    set,
  };
}

export default useSession;
