export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal_sent"
  | "negotiation"
  | "won"
  | "lost";


export interface Lead {
  _id: string;

  name: string;
  email: string;
  phone: string;

  company?: string;
  position?: string;

  source?: string;

  value?: number;

  status: LeadStatus;

  nextFollowUp?: string;

  notes?: string;

  createdAt: string;
  updatedAt?: string;
}