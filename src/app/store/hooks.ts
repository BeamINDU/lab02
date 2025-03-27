import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// ใช้แทน useDispatch ในแอป
export const useAppDispatch = () => useDispatch<AppDispatch>();

// ใช้แทน useSelector เพื่อให้รู้จักประเภทของ State
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
