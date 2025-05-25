import { db } from "../database/firebaseConfig";
import { collection, getDocs, addDoc } from "firebase/firestore";
import type { PracticePair, PerformanceRecord } from "../types/practice";

export async function fetchPracticePairs(): Promise<PracticePair[]> {
  const snap = await getDocs(collection(db,"practice_pairs"));
  return snap.docs.map(d=>({ id:d.id, ...(d.data() as any) }));
}

export async function savePerformanceRecord(rec: Omit<PerformanceRecord,'id'>): Promise<string> {
  const ref = await addDoc(collection(db, "activity_performance"), rec);
  return ref.id;
}
