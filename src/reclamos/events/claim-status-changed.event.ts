export type ClaimStatusChangedEvent = {
  version: '1';
  correlationId: string;
  idempotencyKey: string;
  occurredAt: string;
  producer: 'ms-reclamos';
  actor: { id?: string; roles?: string[] };
  municipalityId?: string;
  claimId: string;
  trackingCode: string;
  newStatus: string;
  recipientPhone?: string;
  recipientEmail?: string;
};
