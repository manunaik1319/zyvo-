import { useSpaceStore } from '../store/spaceStore';

export function useSpaces() {
  const { spaces, setSpaces } = useSpaceStore();
  return { spaces, setSpaces };
}
