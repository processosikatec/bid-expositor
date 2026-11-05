// ============================================================================
// CONTEÚDO DO EVENTO — tudo aqui é PLACEHOLDER. Edite este arquivo com os
// dados reais do BID (datas, local, regras do manual, contatos).
// ============================================================================

// Dados confirmados em conexao.bid: nome, data (11 e 12/11/2026), local
// (Alameda Hall, Bauru/SP). O resto continua placeholder [entre colchetes].
export const EVENT = {
  shortName: 'BID',
  name: 'BID 2026',
  fullName: 'BID — Business Innovation Day 2026',
  tagline: 'O interior paulista é palco da inovação.',
  edition: 2026,
  nextEdition: 2027,
  dateLabel: '11 e 12 de novembro de 2026',
  hoursLabel: '[horário a confirmar]',
  venue: 'Alameda Hall',
  city: 'Bauru • SP',
  address: '[endereço do Alameda Hall] — Bauru/SP',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Alameda+Hall+Bauru',
  siteUrl: 'https://conexao.bid',
  contacts: {
    email: '[expositores@conexao.bid]',
    whatsapp: '[+55 14 00000-0000]',
    hours: 'Seg a sex, 9h às 18h',
  },
  timezone: 'America/Sao_Paulo',
} as const;

export const KEY_DATES: { label: string; date: string; note?: string }[] = [
  { label: 'Prazo de envio dos documentos', date: '2026-11-06', note: '[confirmar prazo]' },
  { label: 'Envio da lista de credenciados', date: '2026-11-07', note: '[confirmar prazo]' },
  { label: 'Montagem dos estandes', date: '2026-11-10', note: '[confirmar horário]' },
  { label: 'BID 2026 — Dia 1', date: '2026-11-11', note: 'Alameda Hall · Bauru' },
  { label: 'BID 2026 — Dia 2 e desmontagem', date: '2026-11-12', note: '[desmontagem após o encerramento]' },
];

export type ManualSection = {
  id: string;
  title: string;
  intro?: string;
  items: { title: string; body: string }[];
};

export const MANUAL_SECTIONS: ManualSection[] = [
  {
    id: 'informacoes-gerais',
    title: 'Informações gerais',
    intro: 'Visão geral do evento, local e canais de atendimento ao expositor.',
    items: [
      { title: 'Local e horários', body: `${EVENT.venue}, ${EVENT.address}. Funcionamento ao público: ${EVENT.hoursLabel}. Expositores têm acesso 1h antes da abertura.` },
      { title: 'Atendimento ao expositor', body: `E-mail ${EVENT.contacts.email} e WhatsApp ${EVENT.contacts.whatsapp} (${EVENT.contacts.hours}). Durante o evento, a secretaria fica [local no Alameda Hall].` },
      { title: 'Programação', body: '[Descreva palestras, rodadas de negócio e atividades paralelas.]' },
    ],
  },
  {
    id: 'credenciamento',
    title: 'Credenciamento',
    intro: 'Como cadastrar e retirar as credenciais da equipe do estande.',
    items: [
      { title: 'Quantidade de credenciais', body: '[Ex.: 1 credencial a cada 3 m², limitado a 10 por estande.]' },
      { title: 'Retirada', body: '[Ex.: retirada na secretaria com documento com foto, a partir do primeiro dia de montagem.]' },
      { title: 'Montadores', body: '[Ex.: credencial de montagem separada, válida apenas nos dias de montagem e desmontagem.]' },
    ],
  },
  {
    id: 'montagem',
    title: 'Montagem e desmontagem',
    intro: 'Regras, horários e responsabilidades na montagem e desmontagem dos estandes.',
    items: [
      { title: 'Horários', body: '[Montagem: 10/11. Desmontagem: 12/11, após o encerramento. Confirmar horários.]' },
      { title: 'Altura máxima e recuos', body: '[Ex.: altura máxima de 4 m; elementos acima de 2,5 m devem recuar 1 m das divisas.]' },
      { title: 'Montadora própria', body: '[Ex.: obrigatório enviar projeto e ART/RRT até o prazo. Sem aprovação, a montagem não é liberada.]' },
      { title: 'Resíduos', body: '[Ex.: todo material deve ser retirado ao fim da desmontagem; sujeito a multa.]' },
    ],
  },
  {
    id: 'servicos',
    title: 'Serviços e instalações',
    items: [
      { title: 'Energia elétrica', body: '[Ex.: carga padrão de 1 kVA a cada 10 m². Carga adicional deve ser contratada até 30/11.]' },
      { title: 'Internet', body: '[Ex.: Wi-Fi compartilhado gratuito; link dedicado sob consulta.]' },
      { title: 'Limpeza e segurança', body: '[Ex.: limpeza das áreas comuns inclusa; segurança interna do estande é responsabilidade do expositor.]' },
    ],
  },
  {
    id: 'logistica',
    title: 'Logística e cargas',
    items: [
      { title: 'Entrada de cargas', body: '[Ex.: portão 3, com agendamento prévio; veículos até 8 m.]' },
      { title: 'Estacionamento', body: '[Ex.: estacionamento do pavilhão com desconto para expositores credenciados.]' },
    ],
  },
  {
    id: 'regras',
    title: 'Regras e segurança',
    items: [
      { title: 'Normas de segurança', body: '[Ex.: proibido uso de materiais inflamáveis, gás e fogo; extintores devem permanecer desobstruídos.]' },
      { title: 'Som e ativações', body: '[Ex.: limite de 70 dB medidos na divisa do estande.]' },
      { title: 'Alimentos e bebidas', body: '[Ex.: distribuição permitida apenas com autorização prévia da organização.]' },
    ],
  },
  {
    id: 'faq',
    title: 'Perguntas frequentes',
    items: [
      { title: 'Posso trocar o responsável pelo estande?', body: 'Sim. Peça à organização pelo e-mail de atendimento; ela atualiza o contato e envia um novo link de acesso.' },
      { title: 'Perdi meu link de acesso. E agora?', body: 'Na página Entrar, informe o e-mail cadastrado e você receberá um link mágico. Se preferir, peça um novo QR code à organização.' },
      { title: 'Meu documento foi reprovado.', body: 'Veja o motivo em Documentos, corrija e envie novamente. O status volta para "Em análise".' },
    ],
  },
];

export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  href?: string;
  /** Concluída automaticamente pelo sistema (não tem checkbox). */
  auto?: 'documentos';
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 'boas-vindas', title: 'Conheça o painel', description: 'Veja onde ficam seu estande, documentos e o manual do expositor.' },
  { id: 'ler-manual', title: 'Leia o manual do expositor', description: 'Regras de montagem, credenciamento, segurança e logística.', href: '/manual' },
  { id: 'conferir-estande', title: 'Confira seu estande', description: 'Localização, metragem e horários de montagem e desmontagem.', href: '/expositor/estande' },
  { id: 'documentos', title: 'Envie os documentos obrigatórios', description: 'Concluída automaticamente quando todos os obrigatórios forem enviados.', href: '/expositor/documentos', auto: 'documentos' },
  { id: 'montadora', title: 'Defina sua montadora', description: 'Informe à organização se usará montagem básica ou montadora própria.' },
  { id: 'credenciamento', title: 'Prepare o credenciamento da equipe', description: 'Separe nome e documento de quem trabalhará no estande.', href: '/manual#credenciamento' },
];
