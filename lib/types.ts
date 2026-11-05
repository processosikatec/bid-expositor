export type Role = 'admin' | 'exhibitor';

export type Exhibitor = {
  id: string;
  edition: number;
  company_name: string;
  trade_name: string | null;
  cnpj: string | null;
  segment: string | null;
  contact_name: string | null;
  contact_email: string;
  contact_phone: string | null;
  status: 'pendente' | 'confirmado' | 'cancelado';
  access_token: string | null;
  access_token_expires_at: string | null;
  onboarding_steps: Record<string, string>;
  created_at: string;
};

export type Stand = {
  id: string;
  exhibitor_id: string;
  edition: number;
  code: string;
  pavilion: string | null;
  street: string | null;
  area_m2: number | null;
  stand_type: string | null;
  power_kva: number | null;
  setup_start: string | null;
  setup_end: string | null;
  teardown_start: string | null;
  teardown_end: string | null;
  map_x: number | null;
  map_y: number | null;
  notes: string | null;
};

export type DocumentType = {
  id: string;
  edition: number;
  name: string;
  description: string | null;
  required: boolean;
  due_date: string | null;
  template_url: string | null;
  sort: number;
};

export type DocStatus = 'enviado' | 'aprovado' | 'reprovado';

export type ExhibitorDocument = {
  id: string;
  exhibitor_id: string;
  document_type_id: string;
  file_path: string;
  file_name: string;
  file_size: number | null;
  status: DocStatus;
  review_note: string | null;
  uploaded_at: string;
  reviewed_at: string | null;
};

export type Application2027 = {
  id: string;
  company_name: string;
  cnpj: string | null;
  contact_name: string;
  email: string;
  phone: string | null;
  segment: string | null;
  desired_area: string | null;
  website: string | null;
  message: string | null;
  status: 'novo' | 'em_contato' | 'aprovado' | 'recusado';
  admin_notes: string | null;
  exhibitor_id: string | null;
  created_at: string;
};

export type FormState = { ok?: boolean; error?: string; message?: string } | null;
