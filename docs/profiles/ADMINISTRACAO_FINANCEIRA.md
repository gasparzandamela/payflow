# Perfil de Utilizador: Administração Financeira

> **Versão:** 1.0  
> **Data de Criação:** 2026-01-06  
> **Última Actualização:** 2026-01-06  
> **Classificação:** Confidencial — Uso Interno

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Missão do Perfil](#missão-do-perfil)
3. [Contexto Organizacional](#contexto-organizacional)
4. [Permissões Detalhadas](#permissões-detalhadas)
5. [Proibições Explícitas](#proibições-explícitas)
6. [Regras de Negócio](#regras-de-negócio)
7. [Limites de Actuação](#limites-de-actuação)
8. [Auditoria e Rastreabilidade](#auditoria-e-rastreabilidade)
9. [Fluxos de Trabalho](#fluxos-de-trabalho)
10. [Safeguards e Restrições Críticas](#safeguards-e-restrições-críticas)
11. [Integrações de Pagamento](#integrações-de-pagamento)
12. [Checklist de Implementação](#checklist-de-implementação)

---

## 📖 Visão Geral

| Atributo | Valor |
|----------|-------|
| **Nome do Perfil** | `ADMIN_FINANCEIRO` |
| **Código do Perfil** | `FIN_001` |
| **Nível de Acesso** | Departamental — Financeiro |
| **Hierarquia** | Reporta à Direcção |
| **Incompatibilidades** | Perfis Académicos, Secretaria Académica |

### Identificadores do Sistema

```typescript
const ROLE_ADMIN_FINANCEIRO = {
  code: 'ADMIN_FINANCEIRO',
  name: 'Administração Financeira',
  department: 'FINANCEIRO',
  level: 3, // 1=Direcção, 2=Coordenação, 3=Operacional
  isAcademic: false,
  isFinancial: true
};
```

---

## 🎯 Missão do Perfil

> **Gerir dinheiro, cobranças e sustentabilidade financeira da escola, sem qualquer controlo sobre decisões académicas.**

### Objectivos Específicos

1. **Gestão de Receitas** — Garantir a cobrança eficiente e atempada das propinas e taxas
2. **Controlo Financeiro** — Manter registos precisos de todas as transacções financeiras
3. **Conformidade** — Assegurar que todas as operações seguem políticas financeiras aprovadas
4. **Relatórios** — Fornecer informação financeira precisa para tomada de decisão
5. **Sustentabilidade** — Contribuir para a saúde financeira da instituição

### Fronteiras de Actuação

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMINISTRAÇÃO FINANCEIRA                  │
│                                                             │
│  ✅ ZONA DE ACTUAÇÃO          │  ⛔ ZONA PROIBIDA           │
│  ─────────────────────        │  ─────────────────          │
│  • Propinas                   │  • Notas                    │
│  • Cobranças                  │  • Matrículas               │
│  • Pagamentos                 │  • Certificados             │
│  • Facturas                   │  • Progressão               │
│  • Recibos                    │  • Dados Curriculares       │
│  • Relatórios Financeiros     │  • Decisões Pedagógicas     │
│                               │                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏢 Contexto Organizacional

### Estrutura da Escola

```
                    ┌─────────────┐
                    │  DIRECÇÃO   │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  SECRETARIA   │  │   ADMIN       │  │  COORDENAÇÃO  │
│  (Académica)  │  │  FINANCEIRA   │  │  PEDAGÓGICA   │
└───────────────┘  └───────────────┘  └───────────────┘
        │                  │                  │
        ▼                  ▼                  ▼
  • Matrículas       • Propinas         • Currículos
  • Certificados     • Cobranças        • Avaliações
  • Registos         • Pagamentos       • Disciplinas
```

### Separação de Responsabilidades

| Área | Responsável | O que NÃO faz |
|------|-------------|---------------|
| **Secretaria** | Matrículas, Certificados, Registos Académicos | Cobranças, Pagamentos |
| **Admin Financeira** | Propinas, Cobranças, Pagamentos, Facturas | Matrículas, Notas, Certificados |
| **Coordenação Pedagógica** | Currículos, Avaliações, Progressão | Pagamentos, Matrículas |

---

## 🔐 Permissões Detalhadas

### 1. Configuração Financeira

| Permissão | Código | Descrição | Requisitos |
|-----------|--------|-----------|------------|
| Criar planos de propinas | `FIN_PLAN_CREATE` | Definir estrutura de propinas por período | Aprovação da Direcção |
| Editar planos de propinas | `FIN_PLAN_EDIT` | Modificar valores e condições | Log de alteração |
| Visualizar planos | `FIN_PLAN_VIEW` | Consultar todas as configurações | — |
| Definir valores por classe | `FIN_CLASS_VALUES` | Estabelecer propinas da 1.ª à 12.ª classe | — |
| Configurar multas | `FIN_PENALTY_CONFIG` | Definir percentagens e condições de multa | — |
| Configurar juros | `FIN_INTEREST_CONFIG` | Definir taxas de juro por atraso | — |
| Gerir descontos | `FIN_DISCOUNT_MANAGE` | Criar e aplicar descontos aprovados | Política aprovada |
| Gerir bolsas | `FIN_SCHOLARSHIP_MANAGE` | Aplicar bolsas conforme políticas | Decisão da Direcção |

```typescript
interface FinancialPlanPermissions {
  FIN_PLAN_CREATE: boolean;
  FIN_PLAN_EDIT: boolean;
  FIN_PLAN_VIEW: boolean;
  FIN_PLAN_DELETE: boolean; // ⚠️ Requer aprovação superior
  FIN_CLASS_VALUES: boolean;
  FIN_PENALTY_CONFIG: boolean;
  FIN_INTEREST_CONFIG: boolean;
  FIN_DISCOUNT_MANAGE: boolean;
  FIN_SCHOLARSHIP_MANAGE: boolean;
}
```

### 2. Gestão de Cobranças

| Permissão | Código | Descrição | Automatização |
|-----------|--------|-----------|---------------|
| Gerar cobranças mensais | `FIN_CHARGE_GENERATE` | Criar cobranças automáticas em lote | Sim, por agendamento |
| Gerar referências de pagamento | `FIN_REF_GENERATE` | Criar referências únicas para pagamento | Automático |
| Reemitir cobranças | `FIN_CHARGE_REISSUE` | Regenerar cobranças não pagas | Manual com justificação |
| Cancelar cobranças | `FIN_CHARGE_CANCEL` | Anular cobranças | ⚠️ Auditoria obrigatória |
| Consultar cobranças | `FIN_CHARGE_VIEW` | Visualizar todas as cobranças | — |

```typescript
interface ChargePermissions {
  FIN_CHARGE_GENERATE: boolean;
  FIN_CHARGE_GENERATE_BATCH: boolean;
  FIN_REF_GENERATE: boolean;
  FIN_CHARGE_REISSUE: boolean;
  FIN_CHARGE_CANCEL: boolean; // Requer: justificação + log
  FIN_CHARGE_VIEW: boolean;
  FIN_CHARGE_EXPORT: boolean;
}
```

### 3. Gestão de Pagamentos

| Permissão | Código | Descrição | Método |
|-----------|--------|-----------|--------|
| Registar pagamento manual | `FIN_PAY_MANUAL` | Inserir pagamentos feitos presencialmente | Com comprovativo |
| Validar comprovativos | `FIN_PAY_VALIDATE` | Aprovar/rejeitar comprovativos submetidos | Análise documental |
| Conciliar pagamentos automáticos | `FIN_PAY_RECONCILE` | Fazer match entre pagamentos e cobranças | MPesa, e-Mola, Banco |
| Processar estornos | `FIN_PAY_REFUND` | Reverter pagamentos conforme regras | ⚠️ Limite de valor |
| Consultar pagamentos | `FIN_PAY_VIEW` | Ver histórico de pagamentos | — |

```typescript
interface PaymentPermissions {
  FIN_PAY_MANUAL: boolean;
  FIN_PAY_VALIDATE: boolean;
  FIN_PAY_RECONCILE: boolean;
  FIN_PAY_REFUND: boolean;
  FIN_PAY_VIEW: boolean;
  FIN_PAY_EXPORT: boolean;
  // Limites
  MAX_MANUAL_PAYMENT: number;      // Limite para pagamento manual
  MAX_REFUND_AMOUNT: number;       // Limite para estorno
  REQUIRES_APPROVAL_ABOVE: number; // Valor acima do qual requer aprovação
}
```

### 4. Documentos Financeiros

| Permissão | Código | Descrição | Formato |
|-----------|--------|-----------|---------|
| Emitir recibos | `FIN_DOC_RECEIPT` | Gerar recibos de pagamento | PDF, Impresso |
| Emitir facturas | `FIN_DOC_INVOICE` | Gerar facturas para entidades | PDF, Electrónico |
| Emitir notas de crédito | `FIN_DOC_CREDIT_NOTE` | Gerar notas de crédito | PDF |
| Anular documentos | `FIN_DOC_VOID` | Anular documentos emitidos | ⚠️ Auditoria |
| Reimprimir documentos | `FIN_DOC_REPRINT` | Gerar segunda via | Log obrigatório |

```typescript
interface DocumentPermissions {
  FIN_DOC_RECEIPT: boolean;
  FIN_DOC_INVOICE: boolean;
  FIN_DOC_CREDIT_NOTE: boolean;
  FIN_DOC_VOID: boolean;        // Requer justificação
  FIN_DOC_REPRINT: boolean;
  FIN_DOC_VIEW_ALL: boolean;
  FIN_DOC_EXPORT: boolean;
}
```

### 5. Relatórios Financeiros

| Permissão | Código | Descrição | Exportação |
|-----------|--------|-----------|------------|
| Consultar inadimplência | `FIN_RPT_DELINQUENCY` | Ver lista de devedores | PDF, CSV |
| Consultar fluxo de caixa | `FIN_RPT_CASHFLOW` | Análise de entradas/saídas | PDF, CSV |
| Relatório de receitas | `FIN_RPT_REVENUE` | Resumo de receitas por período | PDF, CSV |
| Relatório de cobranças | `FIN_RPT_CHARGES` | Estado das cobranças | PDF, CSV |
| Exportar relatórios | `FIN_RPT_EXPORT` | Download em PDF/CSV | — |
| Agendar relatórios | `FIN_RPT_SCHEDULE` | Programar envio automático | Email |

```typescript
interface ReportPermissions {
  FIN_RPT_DELINQUENCY: boolean;
  FIN_RPT_CASHFLOW: boolean;
  FIN_RPT_REVENUE: boolean;
  FIN_RPT_CHARGES: boolean;
  FIN_RPT_PAYMENTS: boolean;
  FIN_RPT_EXPORT: boolean;
  FIN_RPT_SCHEDULE: boolean;
  // Restrições
  MAX_EXPORT_RECORDS: number;     // Limite de registos por export
  ALLOW_HISTORICAL_DATA: boolean; // Acesso a dados históricos
  HISTORICAL_MONTHS: number;      // Meses de histórico acessível
}
```

---

## ⛔ Proibições Explícitas

### Zona Académica — Acesso BLOQUEADO

| Acção Proibida | Código de Bloqueio | Razão |
|----------------|-------------------|-------|
| Criar notas académicas | `BLK_GRADE_CREATE` | Competência exclusiva docente |
| Editar notas académicas | `BLK_GRADE_EDIT` | Competência exclusiva docente |
| Eliminar notas académicas | `BLK_GRADE_DELETE` | Competência exclusiva docente |
| Emitir certificados | `BLK_CERT_ISSUE` | Competência da Secretaria |
| Emitir declarações académicas | `BLK_DECL_ISSUE` | Competência da Secretaria |
| Alterar matrículas | `BLK_ENROLL_EDIT` | Competência da Secretaria |
| Cancelar matrículas | `BLK_ENROLL_CANCEL` | Competência da Secretaria/Direcção |
| Apagar registos de alunos | `BLK_STUDENT_DELETE` | Proibido para todos os perfis operacionais |
| Decidir progressão | `BLK_PROGRESSION` | Competência do Conselho Pedagógico |
| Decidir reprovação | `BLK_RETENTION` | Competência do Conselho Pedagógico |

```typescript
// Estas permissões DEVEM ser sempre FALSE para Admin Financeiro
const BLOCKED_PERMISSIONS = {
  // Académico
  ACADEMIC_GRADE_CREATE: false,
  ACADEMIC_GRADE_EDIT: false,
  ACADEMIC_GRADE_DELETE: false,
  ACADEMIC_GRADE_VIEW: false, // Nota: Pode ver se aluno está regular, não as notas
  
  // Certificação
  ACADEMIC_CERT_ISSUE: false,
  ACADEMIC_CERT_VIEW: false,
  ACADEMIC_DECL_ISSUE: false,
  
  // Matrícula
  ENROLLMENT_CREATE: false,
  ENROLLMENT_EDIT: false,
  ENROLLMENT_CANCEL: false,
  ENROLLMENT_VIEW_FULL: false, // Pode ver status, não detalhes
  
  // Gestão de Alunos
  STUDENT_CREATE: false,
  STUDENT_DELETE: false,
  STUDENT_EDIT_PERSONAL: false,
  
  // Decisões Pedagógicas
  PEDAGOGY_PROGRESSION: false,
  PEDAGOGY_RETENTION: false,
  PEDAGOGY_DISCIPLINE: false,
  
  // Administração do Sistema
  SYSTEM_USER_CREATE: false,  // Exceto se combinado com perfil de IT
  SYSTEM_ROLE_MANAGE: false,
  SYSTEM_CONFIG_CRITICAL: false
};
```

### Visualização Limitada de Dados Académicos

O perfil **pode visualizar** apenas o essencial para cobrança:

```typescript
interface AcademicDataVisibility {
  // ✅ PODE VER
  studentName: boolean;           // true - Para identificação
  studentCode: boolean;           // true - Para referência
  enrollmentStatus: boolean;      // true - Activo/Inactivo
  currentClass: boolean;          // true - Para definir valor da propina
  enrollmentYear: boolean;        // true - Para contexto temporal
  guardianInfo: boolean;          // true - Para cobrança
  
  // ⛔ NÃO PODE VER
  grades: boolean;               // false
  attendance: boolean;           // false
  behaviorRecords: boolean;      // false
  medicalInfo: boolean;          // false
  curriculumDetails: boolean;    // false
  teacherNotes: boolean;         // false
  disciplinaryRecords: boolean;  // false
}
```

---

## 📏 Regras de Negócio

### 1. Cálculo de Propinas

```typescript
interface TuitionCalculation {
  baseAmount: number;          // Valor base por classe
  discounts: Discount[];       // Descontos aplicáveis
  scholarships: Scholarship[]; // Bolsas atribuídas
  penalties: Penalty[];        // Multas por atraso
  interests: Interest[];       // Juros por atraso
  finalAmount: number;         // Valor final a pagar
}

// Fórmula: FinalAmount = (BaseAmount - Discounts - Scholarships) + Penalties + Interests
```

### 2. Multas por Atraso

| Dias de Atraso | Multa (%) | Observação |
|----------------|-----------|------------|
| 1-7 dias | 5% | Aviso amigável |
| 8-15 dias | 10% | Primeira notificação |
| 16-30 dias | 15% | Segunda notificação |
| 31+ dias | 20% | Máximo + Bloqueio automático |

```typescript
interface PenaltyRules {
  gracePeriodDays: number;        // Período de carência (ex: 5 dias)
  penaltyTiers: PenaltyTier[];
  maxPenaltyPercent: number;      // Limite máximo (ex: 20%)
  applyToTotal: boolean;          // Aplicar sobre total ou base
}

interface PenaltyTier {
  minDays: number;
  maxDays: number;
  percentage: number;
}
```

### 3. Juros por Atraso

```typescript
interface InterestRules {
  dailyRate: number;              // Taxa diária (ex: 0.1%)
  monthlyRate: number;            // Taxa mensal (ex: 3%)
  maxInterestPercent: number;     // Limite máximo
  compoundInterest: boolean;      // Juros compostos?
  calculationBase: 'TOTAL' | 'OUTSTANDING' | 'ORIGINAL';
}
```

### 4. Políticas de Desconto

| Tipo de Desconto | Condição | Percentagem | Aprovador |
|------------------|----------|-------------|-----------|
| Pontualidade | Pagamento até dia 5 | 5% | Automático |
| Irmãos | 2+ irmãos matriculados | 10% por irmão adicional | Admin Financeiro |
| Funcionário | Filho de funcionário | 15-50% | Direcção |
| Bolsa Mérito | Média > 16 valores | 20-100% | Conselho Pedagógico |
| Bolsa Social | Avaliação socioeconómica | 20-100% | Direcção + Assistente Social |

```typescript
interface DiscountPolicy {
  code: string;
  name: string;
  type: 'AUTOMATIC' | 'MANUAL' | 'APPROVED';
  percentage: number;
  conditions: DiscountCondition[];
  approvalRequired: boolean;
  approverRole?: string;
  validFrom: Date;
  validTo?: Date;
  maxUsagePerStudent?: number;
  stackable: boolean;  // Pode acumular com outros descontos?
}
```

### 5. Bloqueio Académico por Dívida

> ⚠️ **REGRA CRÍTICA**: Os bloqueios são **AUTOMÁTICOS**, baseados em política, **não** por decisão do Admin Financeiro.

```typescript
interface DebtBlockPolicy {
  // Configuração (definida pela Direcção, não pelo Financeiro)
  monthsOverdueForBlock: number;     // Meses para bloqueio (ex: 3)
  minimumDebtForBlock: number;       // Valor mínimo (ex: 1 mês)
  
  // Impactos do bloqueio
  blockExamAccess: boolean;          // Bloquear acesso a exames
  blockCertificates: boolean;        // Bloquear emissão de certificados
  blockReenrollment: boolean;        // Bloquear rematrícula
  
  // O que o bloqueio NÃO faz
  blockClassAttendance: boolean;     // false - Aluno pode frequentar aulas
  affectGrades: boolean;             // false - Notas não são afectadas
  expelStudent: boolean;             // false - Não expulsa automaticamente
}

// O Admin Financeiro NÃO pode:
// - Decidir manualmente quem bloquear
// - Desbloquear sem pagamento
// - Alterar as regras de bloqueio
```

---

## 🚧 Limites de Actuação

### Limites Financeiros por Transacção

| Operação | Limite Individual | Limite Diário | Requer Aprovação |
|----------|-------------------|---------------|------------------|
| Pagamento Manual | 50.000 MZN | 200.000 MZN | > 50.000 MZN |
| Estorno | 25.000 MZN | 100.000 MZN | > 10.000 MZN |
| Desconto Manual | 30% | N/A | > 20% |
| Cancelamento de Cobrança | Sem limite | 5 por dia | Sempre |
| Nota de Crédito | 50.000 MZN | 100.000 MZN | > 25.000 MZN |

```typescript
interface OperationalLimits {
  payments: {
    manualPaymentMax: number;
    manualPaymentDailyMax: number;
    requiresApprovalAbove: number;
  };
  refunds: {
    refundMax: number;
    refundDailyMax: number;
    requiresApprovalAbove: number;
  };
  discounts: {
    maxDiscountPercent: number;
    requiresApprovalAbove: number;
  };
  cancellations: {
    dailyLimit: number;
    alwaysRequiresJustification: boolean;
  };
  creditNotes: {
    maxAmount: number;
    dailyMax: number;
    requiresApprovalAbove: number;
  };
}

const DEFAULT_LIMITS: OperationalLimits = {
  payments: {
    manualPaymentMax: 50000,
    manualPaymentDailyMax: 200000,
    requiresApprovalAbove: 50000
  },
  refunds: {
    refundMax: 25000,
    refundDailyMax: 100000,
    requiresApprovalAbove: 10000
  },
  discounts: {
    maxDiscountPercent: 30,
    requiresApprovalAbove: 20
  },
  cancellations: {
    dailyLimit: 5,
    alwaysRequiresJustification: true
  },
  creditNotes: {
    maxAmount: 50000,
    dailyMax: 100000,
    requiresApprovalAbove: 25000
  }
};
```

### Limites Temporais

```typescript
interface TemporalLimits {
  // Período de operação
  editableHistoryDays: number;       // Dias para editar transacções (ex: 30)
  voidableDocumentDays: number;      // Dias para anular documentos (ex: 7)
  refundWindowDays: number;          // Janela para estornos (ex: 90)
  
  // Relatórios
  maxHistoricalMonths: number;       // Meses de histórico acessível (ex: 24)
  maxExportRecords: number;          // Registos por export (ex: 10000)
  
  // Prazos de retenção
  auditLogRetentionYears: number;    // Retenção de logs (ex: 7 anos)
  financialRecordRetentionYears: number; // Retenção de registos (ex: 10 anos)
}
```

---

## 📝 Auditoria e Rastreabilidade

### Eventos Auditáveis

Todas as acções do Admin Financeiro são registadas:

```typescript
interface AuditEvent {
  id: string;                        // UUID do evento
  timestamp: Date;                   // Data/hora exacta
  userId: string;                    // ID do utilizador
  userRole: string;                  // Perfil activo
  ipAddress: string;                 // IP de origem
  userAgent: string;                 // Browser/dispositivo
  sessionId: string;                 // Sessão actual
  
  // Detalhes da acção
  action: AuditAction;               // Tipo de acção
  resource: string;                  // Recurso afectado
  resourceId: string;                // ID do recurso
  previousValue?: any;               // Valor anterior (para edições)
  newValue?: any;                    // Novo valor
  justification?: string;            // Justificação (quando requerida)
  
  // Metadados
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresReview: boolean;
  relatedEvents?: string[];          // Eventos relacionados
}

type AuditAction = 
  | 'CHARGE_CREATE'
  | 'CHARGE_CANCEL'
  | 'CHARGE_REISSUE'
  | 'PAYMENT_REGISTER'
  | 'PAYMENT_VALIDATE'
  | 'PAYMENT_REJECT'
  | 'REFUND_PROCESS'
  | 'REFUND_APPROVE'
  | 'REFUND_REJECT'
  | 'DOCUMENT_CREATE'
  | 'DOCUMENT_VOID'
  | 'DOCUMENT_REPRINT'
  | 'CONFIG_CHANGE'
  | 'DISCOUNT_APPLY'
  | 'PENALTY_OVERRIDE'
  | 'REPORT_EXPORT'
  | 'REPORT_SCHEDULE';
```

### Acções que Requerem Justificação Obrigatória

| Acção | Justificação Mínima | Aprovação Adicional |
|-------|---------------------|---------------------|
| Cancelar cobrança | 50 caracteres | Não |
| Processar estorno > 10.000 MZN | 100 caracteres | Sim, Direcção |
| Anular documento | 50 caracteres | Não |
| Aplicar desconto > 20% | 100 caracteres | Sim, Direcção |
| Override de multa/juro | 100 caracteres | Sim, Direcção |

```typescript
interface JustificationRequirement {
  action: AuditAction;
  minCharacters: number;
  requiresApproval: boolean;
  approverRole?: string;
  mustAttachDocument: boolean;
  documentTypes?: string[];
}

const JUSTIFICATION_REQUIREMENTS: JustificationRequirement[] = [
  {
    action: 'CHARGE_CANCEL',
    minCharacters: 50,
    requiresApproval: false,
    mustAttachDocument: false
  },
  {
    action: 'REFUND_PROCESS',
    minCharacters: 100,
    requiresApproval: true, // Se valor > limite
    approverRole: 'DIRECCAO',
    mustAttachDocument: true,
    documentTypes: ['REFUND_REQUEST', 'BANK_STATEMENT']
  },
  {
    action: 'DOCUMENT_VOID',
    minCharacters: 50,
    requiresApproval: false,
    mustAttachDocument: false
  },
  {
    action: 'PENALTY_OVERRIDE',
    minCharacters: 100,
    requiresApproval: true,
    approverRole: 'DIRECCAO',
    mustAttachDocument: true,
    documentTypes: ['APPROVAL_DOCUMENT']
  }
];
```

### Log de Auditoria — Estrutura SQL

```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Utilizador
    user_id UUID NOT NULL REFERENCES auth.users(id),
    user_role VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    
    -- Acção
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    
    -- Dados
    previous_value JSONB,
    new_value JSONB,
    justification TEXT,
    
    -- Metadados
    risk_level VARCHAR(20) DEFAULT 'LOW',
    requires_review BOOLEAN DEFAULT FALSE,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    
    -- Índices para pesquisa
    search_vector TSVECTOR
);

-- Índices para performance
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_timestamp ON audit_log(created_at DESC);
CREATE INDEX idx_audit_review ON audit_log(requires_review) WHERE requires_review = TRUE;
```

---

## 🔄 Fluxos de Trabalho

### 1. Fluxo de Cobrança Mensal

```
┌─────────────────┐
│ Início do Mês   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────────────────┐
│ Gerar Cobranças │────▶│ Para cada aluno activo:     │
│ em Lote         │     │ • Calcular valor base       │
└────────┬────────┘     │ • Aplicar descontos/bolsas  │
         │              │ • Gerar referência única    │
         ▼              └─────────────────────────────┘
┌─────────────────┐
│ Enviar          │
│ Notificações    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Aguardar        │
│ Pagamentos      │──────────┐
└────────┬────────┘          │
         │                   │
    ┌────┴────┐         ┌────┴────┐
    ▼         ▼         ▼         ▼
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│MPesa  │ │e-Mola │ │Banco  │ │Manual │
│Auto   │ │Auto   │ │Auto   │ │Balcão │
└───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘
    │         │         │         │
    └────┬────┴────┬────┘         │
         │         │              │
         ▼         ▼              ▼
┌─────────────────┐     ┌─────────────────┐
│ Conciliação     │     │ Registar +      │
│ Automática      │     │ Validar Comprova│
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Emitir Recibo   │
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Actualizar      │
            │ Estado do Aluno │
            └─────────────────┘
```

### 2. Fluxo de Pagamento Manual

```
┌─────────────────┐
│ Encarregado     │
│ no Balcão       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Identificar     │
│ Aluno           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Verificar       │
│ Cobranças       │
│ Pendentes       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐              ┌─────────────────┐
│ Receber         │─────────────▶│ • Dinheiro      │
│ Pagamento       │              │ • Cheque        │
└────────┬────────┘              │ • Transferência │
         │                       └─────────────────┘
         ▼
┌─────────────────┐
│ Registar no     │ ──▶ Log de Auditoria
│ Sistema         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Emitir Recibo   │
│ e Entregar      │
└─────────────────┘
```

### 3. Fluxo de Estorno

```
┌─────────────────┐
│ Pedido de       │
│ Estorno         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────────────────┐
│ Verificar       │     │ Critérios:                  │
│ Elegibilidade   │────▶│ • Dentro do prazo (90 dias) │
└────────┬────────┘     │ • Pagamento válido          │
         │              │ • Sem estorno anterior      │
         ▼              └─────────────────────────────┘
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│≤10.000│ │>10.000│
│  MZN  │ │  MZN  │
└───┬───┘ └───┬───┘
    │         │
    ▼         ▼
┌───────┐ ┌───────────┐
│Aprovar│ │Encaminhar │
│Directo│ │p/ Direcção│
└───┬───┘ └─────┬─────┘
    │           │
    │     ┌─────┴─────┐
    │     ▼           ▼
    │ ┌───────┐   ┌───────┐
    │ │Aprovado│  │Rejeitado│
    │ └───┬───┘   └───┬───┘
    │     │           │
    └──┬──┘           ▼
       │        ┌─────────────┐
       ▼        │ Notificar   │
┌─────────────┐ │ Requerente  │
│ Processar   │ └─────────────┘
│ Estorno     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Emitir Nota │
│ de Crédito  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Actualizar  │
│ Saldos      │
└─────────────┘
```

---

## 🛡️ Safeguards e Restrições Críticas

### Regra 1: Separação Absoluta Financeiro/Académico

```typescript
// Validação em cada acesso
function validateAccess(userId: string, resource: string): boolean {
  const userRole = getUserRole(userId);
  
  if (userRole === 'ADMIN_FINANCEIRO') {
    if (ACADEMIC_RESOURCES.includes(resource)) {
      logSecurityEvent({
        type: 'BLOCKED_ACCESS',
        userId,
        resource,
        reason: 'Financial role cannot access academic resources'
      });
      return false;
    }
  }
  
  return true;
}

const ACADEMIC_RESOURCES = [
  'grades',
  'certificates',
  'enrollments',
  'curriculum',
  'attendance',
  'discipline',
  'progression',
  'evaluations'
];
```

### Regra 2: Bloqueios Automáticos por Política

```typescript
// Bloqueio NUNCA é decisão manual do Financeiro
interface AcademicBlockPolicy {
  // Configurado pela Direcção, não editável pelo Financeiro
  readonly enabled: boolean;
  readonly monthsOverdue: number;
  readonly minimumDebt: number;
  
  // Execução automática
  checkAndBlock(): void;
  
  // Desbloqueio apenas por:
  // 1. Pagamento total da dívida
  // 2. Acordo de pagamento aprovado pela Direcção
  // 3. Decisão da Direcção (casos excepcionais)
}

// O Admin Financeiro pode:
// ✅ Ver quem está bloqueado
// ✅ Ver o motivo
// ✅ Registar pagamento (que desbloqueia automaticamente)
// ❌ Desbloquear manualmente
// ❌ Bloquear manualmente
// ❌ Alterar as regras
```

### Regra 3: Auditoria Obrigatória

```typescript
// Middleware de auditoria
async function auditMiddleware(req: Request, res: Response, next: NextFunction) {
  const action = getActionFromRequest(req);
  
  // Acções que SEMPRE requerem justificação
  const REQUIRE_JUSTIFICATION = [
    'CHARGE_CANCEL',
    'REFUND_PROCESS',
    'DOCUMENT_VOID',
    'DISCOUNT_APPLY_MANUAL',
    'PENALTY_OVERRIDE'
  ];
  
  if (REQUIRE_JUSTIFICATION.includes(action)) {
    if (!req.body.justification || req.body.justification.length < 50) {
      return res.status(400).json({
        error: 'Justificação obrigatória (mínimo 50 caracteres)'
      });
    }
  }
  
  // Registar evento
  await createAuditLog({
    userId: req.user.id,
    action,
    resource: req.path,
    data: req.body,
    justification: req.body.justification
  });
  
  next();
}
```

### Regra 4: Incompatibilidade de Perfis

```typescript
// Perfis que NÃO podem coexistir com ADMIN_FINANCEIRO
const INCOMPATIBLE_ROLES = [
  'PROFESSOR',           // Pode ver notas
  'COORDENADOR_TURMA',   // Pode editar notas
  'SECRETARIA',          // Pode editar matrículas
  'ADMIN_ACADEMICO'      // Acesso total académico
];

function assignRole(userId: string, newRole: string): Result {
  const currentRoles = getUserRoles(userId);
  
  if (newRole === 'ADMIN_FINANCEIRO') {
    const conflicts = currentRoles.filter(r => INCOMPATIBLE_ROLES.includes(r));
    
    if (conflicts.length > 0) {
      return {
        success: false,
        error: `Não é possível atribuir o perfil Financeiro. Conflito com: ${conflicts.join(', ')}`
      };
    }
  }
  
  return { success: true };
}
```

### Regra 5: Limites de Valor Invioláveis

```typescript
// Limites hardcoded que não podem ser alterados pelo utilizador
const HARD_LIMITS = {
  SINGLE_TRANSACTION_MAX: 500000,      // 500.000 MZN
  DAILY_REFUND_MAX: 100000,            // 100.000 MZN
  MAX_DISCOUNT_PERCENT: 50,            // 50%
  VOID_WINDOW_DAYS: 30,                // 30 dias
  
  // Limites que requerem aprovação superior
  APPROVAL_THRESHOLD_PAYMENT: 50000,
  APPROVAL_THRESHOLD_REFUND: 10000,
  APPROVAL_THRESHOLD_DISCOUNT: 20
} as const;

// Validação inviolável
function validateTransaction(amount: number, type: string): ValidationResult {
  if (type === 'REFUND' && amount > HARD_LIMITS.SINGLE_TRANSACTION_MAX) {
    return {
      valid: false,
      error: 'Valor excede o limite máximo do sistema',
      requiresEscalation: true
    };
  }
  
  return { valid: true };
}
```

---

## 💳 Integrações de Pagamento

### Métodos de Pagamento Suportados

#### 1. Pagamentos Automáticos (Integração API)

```typescript
interface PaymentGateway {
  name: string;
  code: string;
  type: 'MOBILE_MONEY' | 'BANK' | 'CARD';
  enabled: boolean;
  config: GatewayConfig;
}

const PAYMENT_GATEWAYS: PaymentGateway[] = [
  {
    name: 'M-Pesa',
    code: 'MPESA',
    type: 'MOBILE_MONEY',
    enabled: true,
    config: {
      apiEndpoint: process.env.MPESA_API_URL,
      merchantId: process.env.MPESA_MERCHANT_ID,
      shortcode: process.env.MPESA_SHORTCODE,
      webhookUrl: '/api/webhooks/mpesa',
      callbackUrl: '/api/callbacks/mpesa',
      timeout: 30000,
      retryAttempts: 3
    }
  },
  {
    name: 'e-Mola',
    code: 'EMOLA',
    type: 'MOBILE_MONEY',
    enabled: true,
    config: {
      apiEndpoint: process.env.EMOLA_API_URL,
      merchantCode: process.env.EMOLA_MERCHANT_CODE,
      webhookUrl: '/api/webhooks/emola',
      timeout: 30000
    }
  },
  {
    name: 'Integração Bancária',
    code: 'BANK_TRANSFER',
    type: 'BANK',
    enabled: true,
    config: {
      banks: ['BCI', 'MILLENNIUM_BIM', 'STANDARD_BANK'],
      accountNumber: process.env.SCHOOL_ACCOUNT,
      nib: process.env.SCHOOL_NIB,
      swift: process.env.SCHOOL_SWIFT,
      reconciliationSchedule: '0 */4 * * *' // A cada 4 horas
    }
  }
];
```

#### 2. Pagamentos Manuais (Com Comprovativo)

```typescript
interface ManualPaymentRequest {
  studentId: string;
  chargeIds: string[];
  amount: number;
  paymentMethod: ManualPaymentMethod;
  proofOfPayment: ProofDocument;
  receivedBy: string;
  notes?: string;
}

type ManualPaymentMethod = 
  | 'CASH'           // Numerário
  | 'CHEQUE'         // Cheque
  | 'BANK_DEPOSIT'   // Depósito bancário
  | 'BANK_TRANSFER'; // Transferência bancária

interface ProofDocument {
  type: 'RECEIPT' | 'DEPOSIT_SLIP' | 'TRANSFER_CONFIRMATION' | 'CHEQUE_COPY';
  fileUrl: string;
  fileHash: string;  // Para garantir integridade
  uploadedAt: Date;
  validatedAt?: Date;
  validatedBy?: string;
}
```

#### 3. Fluxo de Selecção de Método pelo Utilizador

```typescript
// Interface para o encarregado escolher o método
interface PaymentMethodSelection {
  // Opção 1: Pagamento Automático
  automatic: {
    mpesa: {
      phone: string;     // Número M-Pesa
      amount: number;
    };
    emola: {
      phone: string;     // Número e-Mola
      amount: number;
    };
    bank: {
      reference: string; // Referência para pagamento
      entity: string;    // Entidade
      amount: number;
    };
  };
  
  // Opção 2: Pagamento Manual
  manual: {
    method: ManualPaymentMethod;
    proof: File;         // Upload do comprovativo
    date: Date;          // Data do pagamento
    notes?: string;
  };
}

// Ecrã de selecção
const PaymentMethodScreen = () => {
  return (
    <div className="payment-methods">
      <h2>Escolha o Método de Pagamento</h2>
      
      <section className="automatic-payments">
        <h3>💳 Pagamento Automático (Instantâneo)</h3>
        <PaymentOption 
          icon="mpesa" 
          name="M-Pesa" 
          description="Pague com o seu número M-Pesa" 
        />
        <PaymentOption 
          icon="emola" 
          name="e-Mola" 
          description="Pague com o seu número e-Mola" 
        />
        <PaymentOption 
          icon="bank" 
          name="Referência Bancária" 
          description="Gere uma referência para pagar no multibanco ou homebanking" 
        />
      </section>
      
      <section className="manual-payments">
        <h3>📄 Pagamento Manual (Com Comprovativo)</h3>
        <PaymentOption 
          icon="upload" 
          name="Submeter Comprovativo" 
          description="Já fez o pagamento? Submeta o comprovativo para validação" 
        />
      </section>
    </div>
  );
};
```

#### 4. Conciliação Automática

```typescript
interface ReconciliationProcess {
  // Executado periodicamente
  schedule: string;  // Cron expression
  
  // Fontes de dados
  sources: {
    mpesaTransactions: Transaction[];
    emolaTransactions: Transaction[];
    bankStatements: BankStatement[];
  };
  
  // Processo de matching
  matchingRules: MatchingRule[];
  
  // Resultados
  matched: MatchedPayment[];
  unmatched: UnmatchedPayment[];
  duplicates: DuplicatePayment[];
  
  // Acções
  autoApprove: boolean;       // Auto-aprovar matches perfeitos
  notifyAdmin: boolean;       // Notificar sobre não-matches
  createExceptions: boolean;  // Criar excepções para revisão
}

interface MatchingRule {
  priority: number;
  field: 'reference' | 'amount' | 'phone' | 'date';
  matchType: 'EXACT' | 'FUZZY' | 'RANGE';
  tolerance?: number;  // Para matches fuzzy
}

// Processo de conciliação
async function runReconciliation(): Promise<ReconciliationResult> {
  const pendingCharges = await getUnpaidCharges();
  const incomingPayments = await getIncomingPayments();
  
  const results: ReconciliationResult = {
    matched: [],
    unmatched: [],
    toReview: []
  };
  
  for (const payment of incomingPayments) {
    const match = findMatchingCharge(payment, pendingCharges);
    
    if (match.confidence === 'HIGH') {
      // Auto-aprovar
      await confirmPayment(payment, match.charge);
      results.matched.push({ payment, charge: match.charge });
    } else if (match.confidence === 'MEDIUM') {
      // Marcar para revisão
      results.toReview.push({ payment, possibleMatches: match.candidates });
    } else {
      // Sem match
      results.unmatched.push(payment);
    }
  }
  
  // Notificar Admin Financeiro
  await notifyReconciliationResults(results);
  
  return results;
}
```

---

## ✅ Checklist de Implementação

### Pré-Requisitos

- [ ] Estrutura de base de dados para RBAC implementada
- [ ] Sistema de autenticação configurado (Supabase Auth)
- [ ] Políticas RLS definidas para cada tabela
- [ ] Sistema de auditoria implementado

### Configuração do Perfil

- [ ] Criar role `ADMIN_FINANCEIRO` no sistema
- [ ] Definir permissões conforme documentado
- [ ] Configurar bloqueios para recursos académicos
- [ ] Implementar validação de incompatibilidade de perfis

### Funcionalidades Financeiras

- [ ] Módulo de configuração de propinas
- [ ] Sistema de geração de cobranças
- [ ] Integração M-Pesa
- [ ] Integração e-Mola
- [ ] Integração bancária
- [ ] Registo de pagamentos manuais
- [ ] Validação de comprovativos
- [ ] Emissão de documentos (recibos, facturas)
- [ ] Relatórios financeiros

### Segurança

- [ ] Auditoria completa implementada
- [ ] Limites de transacção configurados
- [ ] Aprovações para operações críticas
- [ ] Separação de responsabilidades validada
- [ ] Testes de penetração realizados

### Monitorização

- [ ] Dashboard de inadimplência
- [ ] Alertas de transacções atípicas
- [ ] Relatórios de auditoria
- [ ] Métricas de conciliação

---

## 📚 Anexos

### A. Glossário

| Termo | Definição |
|-------|-----------|
| **Cobrança** | Registo de valor devido por um aluno |
| **Conciliação** | Processo de matching entre pagamentos e cobranças |
| **Estorno** | Reversão de um pagamento já processado |
| **Nota de Crédito** | Documento que reduz o valor em dívida |
| **Propina** | Taxa mensal de frequência escolar |
| **RBAC** | Role-Based Access Control - Controlo de acesso baseado em papéis |
| **RLS** | Row Level Security - Segurança ao nível de linha no PostgreSQL |

### B. Referências

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [M-Pesa API Documentation](https://developer.mpesa.vm.co.mz/)
- [ISO 27001 - Information Security](https://www.iso.org/isoiec-27001-information-security.html)

### C. Histórico de Versões

| Versão | Data | Autor | Alterações |
|--------|------|-------|------------|
| 1.0 | 2026-01-06 | Sistema | Versão inicial |

---

> **⚠️ REGRA DE OURO**
> 
> *O Financeiro cobra, controla dinheiro e emite documentos financeiros — mas não controla a vida académica do aluno.*
