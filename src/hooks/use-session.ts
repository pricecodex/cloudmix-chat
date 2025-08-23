import { AuthorizeSessionDto } from "@/entities/session/dtos/authorize-session.dto";

function useSession() {
  const KEY = "loginData";

  function set(data: AuthorizeSessionDto) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function remove() {
    localStorage.removeItem(KEY);
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
