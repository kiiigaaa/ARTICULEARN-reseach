export interface PracticePair { id?:string, word1:string, image1:string, word2:string, image2:string, sentence:string }
export interface PerformanceSummary { total_phonemes:number; substitutions:number; deletions:number; error_rate:number; has_disorder:boolean }
export interface PerformanceRecord { id?:string; userId:string; activity:string; cardIds:[string,string]; timestamp:any; summary:PerformanceSummary; details:any[];}
