import trainersData from '../../src/data/trainers.json';

interface TrainerWithEmail {
  id: string;
  name: string;
  email: string;
}

interface NotifyPayload {
  name: string;
  email: string;
  trainerIds: string[];
}

interface LambdaEvent {
  httpMethod: string;
  body: string | null;
}

interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(statusCode: number, body: unknown): LambdaResponse {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export const handler = async (event: LambdaEvent): Promise<LambdaResponse> => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  let payload: Partial<NotifyPayload>;
  try {
    payload = JSON.parse(event.body ?? '{}');
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  const { name, email, trainerIds } = payload;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return json(400, { error: 'name is required' });
  }
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return json(400, { error: 'A valid email is required' });
  }
  if (!Array.isArray(trainerIds) || trainerIds.length === 0) {
    return json(400, { error: 'trainerIds must be a non-empty array' });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('N8N_WEBHOOK_URL is not set');
    return json(500, { error: 'Server misconfiguration' });
  }

  const trainers: TrainerWithEmail[] = (trainersData as TrainerWithEmail[])
    .filter((t) => trainerIds.includes(t.id))
    .map(({ id, name: trainerName, email: trainerEmail }) => ({
      id,
      name: trainerName,
      email: trainerEmail,
    }));

  const webhookPayload = {
    userName: name.trim(),
    userEmail: email.trim().toLowerCase(),
    trainers,
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(webhookPayload),
  });

  if (!response.ok) {
    console.error('n8n webhook error', response.status, await response.text());
    return json(502, { error: 'Failed to forward notification' });
  }

  return json(200, { ok: true });
};
