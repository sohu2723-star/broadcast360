import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { Prisma } from "@/generated/prisma/client";

type Row = Record<string, any>;
type QueryOptions = {
  where?: Row;
  select?: Row;
  include?: Row;
  orderBy?: Row | Row[];
  skip?: number;
  take?: number;
  distinct?: string[];
  data?: Row;
  cursor?: Row;
};

type ModelDelegate = {
  findMany: (options?: QueryOptions) => Promise<any>;
  findUnique: (options: QueryOptions) => Promise<any>;
  findFirst: (options?: QueryOptions) => Promise<any>;
  count: (options?: QueryOptions) => Promise<number>;
  create: (options: QueryOptions) => Promise<any>;
  update: (options: QueryOptions) => Promise<any>;
  updateMany: (options: QueryOptions) => Promise<{ count: number }>;
  delete: (options: QueryOptions) => Promise<any>;
  deleteMany: (options?: QueryOptions) => Promise<{ count: number }>;
  upsert: (options: QueryOptions & { create: Row; update: Row }) => Promise<any>;
  aggregate: (options?: QueryOptions & Row) => Promise<any>;
  groupBy: (options?: QueryOptions & Row) => Promise<any>;
};

type PrismaFacade = { [K in keyof typeof MODEL_TABLES]: ModelDelegate } & {
  $transaction: {
    (input: readonly Promise<any>[]): Promise<any[]>;
    <T>(input: (tx: PrismaFacade) => Promise<T>): Promise<T>;
  };
  $queryRaw: <T = any>(strings: TemplateStringsArray, ...values: unknown[]) => Promise<T>;
};

const MODEL_TABLES: Record<string, string> = {
  user: "User",
  emailVerificationCode: "EmailVerificationCode",
  creditLedger: "CreditLedger",
  deviceSession: "DeviceSession",
  downloadGrant: "DownloadGrant",
  channel: "Channel",
  movie: "Movie",
  stream: "Stream",
  series: "Series",
  episode: "Episode",
  advertisement: "Advertisement",
  news: "News",
  entertainment: "Entertainment",
  program: "Program",
  playlist: "Playlist",
  playlistItem: "PlaylistItem",
  schedule: "Schedule",
  broadcastSession: "BroadcastSession",
  recording: "Recording",
  watchHistory: "WatchHistory",
  favorite: "Favorite",
  liveViewerSession: "LiveViewerSession",
  advertisementEvent: "AdvertisementEvent",
  subscriptionPlan: "SubscriptionPlan",
  subscriptionOption: "SubscriptionOption",
  subscription: "Subscription",
  payment: "Payment",
  programReminder: "ProgramReminder",
  accountReactivationRequest: "AccountReactivationRequest",
  contactMessage: "ContactMessage",
  supportConversation: "SupportConversation",
  supportMessage: "SupportMessage",
};

const RELATIONS: Record<string, Record<string, { model: string; foreignKey: string; localKey?: string; many: boolean }>> = {
  user: {
    watchHistories: { model: "watchHistory", foreignKey: "userId", many: true },
    favorites: { model: "favorite", foreignKey: "userId", many: true },
    subscriptions: { model: "subscription", foreignKey: "userId", many: true },
    programReminders: { model: "programReminder", foreignKey: "userId", many: true },
    contactMessages: { model: "contactMessage", foreignKey: "userId", many: true },
    supportConversations: { model: "supportConversation", foreignKey: "userId", many: true },
    liveViewerSessions: { model: "liveViewerSession", foreignKey: "userId", many: true },
    advertisementEvents: { model: "advertisementEvent", foreignKey: "userId", many: true },
    reactivationRequests: { model: "accountReactivationRequest", foreignKey: "userId", many: true },
    creditLedger: { model: "creditLedger", foreignKey: "userId", many: true },
    deviceSessions: { model: "deviceSession", foreignKey: "userId", many: true },
    downloadGrants: { model: "downloadGrant", foreignKey: "userId", many: true },
    reviewedReactivationRequests: { model: "accountReactivationRequest", foreignKey: "reviewedById", many: true },
  },
  creditLedger: {
    user: { model: "user", foreignKey: "id", localKey: "userId", many: false },
  },
  deviceSession: {
    user: { model: "user", foreignKey: "id", localKey: "userId", many: false },
  },
  downloadGrant: {
    user: { model: "user", foreignKey: "id", localKey: "userId", many: false },
    movie: { model: "movie", foreignKey: "id", localKey: "movieId", many: false },
    episode: { model: "episode", foreignKey: "id", localKey: "episodeId", many: false },
  },
  channel: {
    streams: { model: "stream", foreignKey: "channelId", many: true },
    news: { model: "news", foreignKey: "channelId", many: true },
    schedules: { model: "schedule", foreignKey: "channelId", many: true },
    recordings: { model: "recording", foreignKey: "channelId", many: true },
    broadcastSessions: { model: "broadcastSession", foreignKey: "channelId", many: true },
    liveViewerSessions: { model: "liveViewerSession", foreignKey: "channelId", many: true },
    programs: { model: "program", foreignKey: "channelId", many: true },
    defaultPlaylist: { model: "playlist", foreignKey: "defaultPlaylistId", localKey: "defaultPlaylistId", many: false },
  },
  movie: {
    playlistItems: { model: "playlistItem", foreignKey: "movieId", many: true },
    favorites: { model: "favorite", foreignKey: "movieId", many: true },
    downloadGrants: { model: "downloadGrant", foreignKey: "movieId", many: true },
  },
  stream: {
    channel: { model: "channel", foreignKey: "id", localKey: "channelId", many: false },
    playlistItems: { model: "playlistItem", foreignKey: "streamId", many: true },
  },
  series: { episodes: { model: "episode", foreignKey: "seriesId", many: true } },
  episode: {
    series: { model: "series", foreignKey: "id", localKey: "seriesId", many: false },
    playlistItems: { model: "playlistItem", foreignKey: "episodeId", many: true },
    favorites: { model: "favorite", foreignKey: "episodeId", many: true },
    downloadGrants: { model: "downloadGrant", foreignKey: "episodeId", many: true },
  },
  advertisement: {
    playlistItems: { model: "playlistItem", foreignKey: "advertisementId", many: true },
    analyticsEvents: { model: "advertisementEvent", foreignKey: "advertisementId", many: true },
  },
  news: {
    channel: { model: "channel", foreignKey: "id", localKey: "channelId", many: false },
    recording: { model: "recording", foreignKey: "id", localKey: "recordingId", many: false },
    playlistItems: { model: "playlistItem", foreignKey: "newsId", many: true },
    watchHistories: { model: "watchHistory", foreignKey: "newsId", many: true },
    favorites: { model: "favorite", foreignKey: "newsId", many: true },
  },
  entertainment: {
    playlistItems: { model: "playlistItem", foreignKey: "entertainmentId", many: true },
    favorites: { model: "favorite", foreignKey: "entertainmentId", many: true },
  },
  program: {
    playlists: { model: "playlist", foreignKey: "programId", many: true },
    channel: { model: "channel", foreignKey: "id", localKey: "channelId", many: false },
  },
  playlist: {
    program: { model: "program", foreignKey: "id", localKey: "programId", many: false },
    items: { model: "playlistItem", foreignKey: "playlistId", many: true },
    schedules: { model: "schedule", foreignKey: "playlistId", many: true },
    defaultForChannels: { model: "channel", foreignKey: "defaultPlaylistId", many: true },
  },
  playlistItem: {
    playlist: { model: "playlist", foreignKey: "id", localKey: "playlistId", many: false },
    movie: { model: "movie", foreignKey: "id", localKey: "movieId", many: false },
    episode: { model: "episode", foreignKey: "id", localKey: "episodeId", many: false },
    advertisement: { model: "advertisement", foreignKey: "id", localKey: "advertisementId", many: false },
    news: { model: "news", foreignKey: "id", localKey: "newsId", many: false },
    stream: { model: "stream", foreignKey: "id", localKey: "streamId", many: false },
    entertainment: { model: "entertainment", foreignKey: "id", localKey: "entertainmentId", many: false },
    watchHistory: { model: "watchHistory", foreignKey: "playlistItemId", many: true },
  },
  schedule: {
    channel: { model: "channel", foreignKey: "id", localKey: "channelId", many: false },
    playlist: { model: "playlist", foreignKey: "id", localKey: "playlistId", many: false },
    sessions: { model: "broadcastSession", foreignKey: "scheduleId", many: true },
    programReminders: { model: "programReminder", foreignKey: "scheduleId", many: true },
  },
  broadcastSession: {
    channel: { model: "channel", foreignKey: "id", localKey: "channelId", many: false },
    schedule: { model: "schedule", foreignKey: "id", localKey: "scheduleId", many: false },
    liveViewerSessions: { model: "liveViewerSession", foreignKey: "broadcastSessionId", many: true },
  },
  recording: {
    channel: { model: "channel", foreignKey: "id", localKey: "channelId", many: false },
    news: { model: "news", foreignKey: "recordingId", many: true },
  },
  watchHistory: {
    user: { model: "user", foreignKey: "id", localKey: "userId", many: false },
    playlistItem: { model: "playlistItem", foreignKey: "id", localKey: "playlistItemId", many: false },
    news: { model: "news", foreignKey: "id", localKey: "newsId", many: false },
  },
  favorite: {
    user: { model: "user", foreignKey: "id", localKey: "userId", many: false },
    movie: { model: "movie", foreignKey: "id", localKey: "movieId", many: false },
    episode: { model: "episode", foreignKey: "id", localKey: "episodeId", many: false },
    entertainment: { model: "entertainment", foreignKey: "id", localKey: "entertainmentId", many: false },
    news: { model: "news", foreignKey: "id", localKey: "newsId", many: false },
  },
  liveViewerSession: {
    user: { model: "user", foreignKey: "id", localKey: "userId", many: false },
    channel: { model: "channel", foreignKey: "id", localKey: "channelId", many: false },
    broadcastSession: { model: "broadcastSession", foreignKey: "id", localKey: "broadcastSessionId", many: false },
  },
  advertisementEvent: {
    advertisement: { model: "advertisement", foreignKey: "id", localKey: "advertisementId", many: false },
    user: { model: "user", foreignKey: "id", localKey: "userId", many: false },
  },
  subscriptionPlan: {
    options: { model: "subscriptionOption", foreignKey: "planId", many: true },
    subscriptions: { model: "subscription", foreignKey: "planId", many: true },
  },
  subscriptionOption: {
    plan: { model: "subscriptionPlan", foreignKey: "id", localKey: "planId", many: false },
    subscriptions: { model: "subscription", foreignKey: "optionId", many: true },
  },
  subscription: {
    user: { model: "user", foreignKey: "id", localKey: "userId", many: false },
    plan: { model: "subscriptionPlan", foreignKey: "id", localKey: "planId", many: false },
    option: { model: "subscriptionOption", foreignKey: "id", localKey: "optionId", many: false },
    payments: { model: "payment", foreignKey: "subscriptionId", many: true },
  },
  payment: { subscription: { model: "subscription", foreignKey: "id", localKey: "subscriptionId", many: false } },
  programReminder: {
    user: { model: "user", foreignKey: "id", localKey: "userId", many: false },
    schedule: { model: "schedule", foreignKey: "id", localKey: "scheduleId", many: false },
  },
  accountReactivationRequest: {
    user: { model: "user", foreignKey: "id", localKey: "userId", many: false },
    reviewedBy: { model: "user", foreignKey: "id", localKey: "reviewedById", many: false },
  },
  contactMessage: { user: { model: "user", foreignKey: "id", localKey: "userId", many: false } },
  supportConversation: {
    user: { model: "user", foreignKey: "id", localKey: "userId", many: false },
    messages: { model: "supportMessage", foreignKey: "conversationId", many: true },
  },
  supportMessage: {
    conversation: { model: "supportConversation", foreignKey: "id", localKey: "conversationId", many: false },
  },
};

let client: SupabaseClient | undefined;
const rowsCache = new Map<string, Row[]>();

function getClient() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_KEY are required");
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
}

async function readRows(model: string) {
  const table = MODEL_TABLES[model];
  if (!table) throw new Error(`Unknown Supabase model: ${model}`);
  if (!rowsCache.has(model)) {
    const { data, error } = await getClient().from(table).select("*");
    if (error) throw new Error(`${table} read failed: ${error.message}`);
    rowsCache.set(model, (data ?? []) as Row[]);
  }
  return rowsCache.get(model)!;
}

function invalidate(model?: string) {
  if (model) rowsCache.delete(model);
  else rowsCache.clear();
}

function normalizeComparable(value: unknown) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).getTime();
  return value;
}

function matchesValue(actual: unknown, condition: unknown): boolean {
  if (condition === undefined) return true;
  if (condition === null) return actual === null || actual === undefined;
  if (typeof condition !== "object" || condition instanceof Date) return normalizeComparable(actual) === normalizeComparable(condition);
  const input = condition as Row;
  if ("equals" in input && !matchesValue(actual, input.equals)) return false;
  if ("in" in input && !(input.in as unknown[]).some((item) => matchesValue(actual, item))) return false;
  if ("notIn" in input && (input.notIn as unknown[]).some((item) => matchesValue(actual, item))) return false;
  if ("not" in input && matchesValue(actual, input.not)) return false;
  const compared = normalizeComparable(actual) as any;
  if ("gt" in input && !(compared > normalizeComparable(input.gt)!)) return false;
  if ("gte" in input && !(compared >= normalizeComparable(input.gte)!)) return false;
  if ("lt" in input && !(compared < normalizeComparable(input.lt)!)) return false;
  if ("lte" in input && !(compared <= normalizeComparable(input.lte)!)) return false;
  if ("contains" in input && !String(actual ?? "").toLowerCase().includes(String(input.contains).toLowerCase())) return false;
  if ("startsWith" in input && !String(actual ?? "").toLowerCase().startsWith(String(input.startsWith).toLowerCase())) return false;
  if ("endsWith" in input && !String(actual ?? "").toLowerCase().endsWith(String(input.endsWith).toLowerCase())) return false;
  return true;
}

function matchesWhere(row: Row, where?: Row): boolean {
  if (!where || Object.keys(where).length === 0) return true;
  if (Array.isArray(where.OR) && !where.OR.some((part: Row) => matchesWhere(row, part))) return false;
  if (Array.isArray(where.AND) && !where.AND.every((part: Row) => matchesWhere(row, part))) return false;
  if (Array.isArray(where.NOT) && where.NOT.some((part: Row) => matchesWhere(row, part))) return false;
  for (const [key, condition] of Object.entries(where)) {
    if (["OR", "AND", "NOT"].includes(key)) continue;
    if (RELATIONS[key]) {
      const relation = RELATIONS[key];
      const definition = relation;
      if (definition) continue;
    }
    if (!matchesValue(row[key], condition)) return false;
  }
  return true;
}

function project(row: Row, selection?: Row) {
  if (!selection) return { ...row };
  const result: Row = {};
  for (const [key, value] of Object.entries(selection)) {
    if (value === true && key in row) result[key] = row[key];
  }
  return result;
}

function sortRows(rows: Row[], orderBy?: Row | Row[]) {
  const orders = Array.isArray(orderBy) ? orderBy : orderBy ? [orderBy] : [];
  if (orders.length === 0) return rows;
  return [...rows].sort((a, b) => {
    for (const order of orders) {
      const [field, direction] = Object.entries(order)[0] ?? [];
      if (!field) continue;
      const av = normalizeComparable(a[field]) as any;
      const bv = normalizeComparable(b[field]) as any;
      if (av === bv) continue;
      const result = av > bv ? 1 : -1;
      return direction === "desc" ? -result : result;
    }
    return 0;
  });
}

function cleanWriteData(data: Row) {
  const result: Row = {};
  for (const [key, value] of Object.entries(data ?? {})) {
    if (key.startsWith("_") || key === "include" || key === "select") continue;
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      if ("connect" in value) {
        result[key] = undefined;
        continue;
      }
      if ("disconnect" in value || "set" in value) continue;
    }
    result[key] = value;
  }
  return result;
}

function applyConnectedRelations(model: string, data: Row) {
  const result = cleanWriteData(data);
  for (const [relationName, definition] of Object.entries(RELATIONS[model] ?? {})) {
    const value = data?.[relationName];
    if (!value || typeof value !== "object") continue;
    if (value.connect) {
      const key = definition.localKey ?? `${relationName}Id`;
      const connect = value.connect as Row;
      result[key] = connect.id ?? connect[Object.keys(connect)[0]];
    }
  }
  return result;
}

async function relatedRows(model: string, row: Row, relationName: string, option: unknown) {
  const definition = RELATIONS[model]?.[relationName];
  if (!definition) return undefined;
  const target = await readRows(definition.model);
  const localValue = row[definition.localKey ?? "id"];
  let matches = target.filter((candidate) => candidate[definition.foreignKey] === localValue);
  if (!definition.many) matches = target.filter((candidate) => candidate.id === localValue).slice(0, 1);
  const nested = option && typeof option === "object" ? option as Row : {};
  matches = sortRows(matches, nested.orderBy);
  if (typeof nested.take === "number") matches = matches.slice(0, nested.take);
  if (typeof nested.skip === "number") matches = matches.slice(nested.skip);
  const selection = nested.select;
  const include = nested.include;
  const projected: any[] = [];
  for (const match of matches) projected.push(await hydrate(definition.model, match, selection, include));
  return definition.many ? projected : projected[0] ?? null;
}

async function hydrate(model: string, row: Row, selection?: Row, include?: Row): Promise<Row> {
  const base = project(row, selection);
  const relationOptions = include ?? selection ?? {};
  for (const [relationName, option] of Object.entries(relationOptions)) {
    if (!(relationName in (RELATIONS[model] ?? {}))) continue;
    const relation = await relatedRows(model, row, relationName, option);
    base[relationName] = relation;
  }
  return base;
}

async function findMany(model: string, options: QueryOptions = {}) {
  let rows = (await readRows(model)).filter((row) => matchesWhere(row, options.where));
  rows = sortRows(rows, options.orderBy);
  if (typeof options.skip === "number") rows = rows.slice(options.skip);
  if (typeof options.take === "number") rows = rows.slice(0, options.take);
  if (options.distinct?.length) {
    const seen = new Set<string>();
    rows = rows.filter((row) => {
      const key = JSON.stringify(options.distinct!.map((field) => row[field]));
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  const result: any[] = [];
  for (const row of rows) result.push(await hydrate(model, row, options.select, options.include));
  return result;
}

async function findUnique(model: string, options: QueryOptions = {}) {
  const result = await findMany(model, { ...options, take: 1 });
  return result[0] ?? null;
}

function firstWhereField(where?: Row) {
  const entries = Object.entries(where ?? {});
  return entries.find(([key]) => !["OR", "AND", "NOT"].includes(key));
}

async function create(model: string, options: QueryOptions) {
  const data = applyConnectedRelations(model, options.data ?? {});
  const { data: created, error } = await getClient().from(MODEL_TABLES[model]).insert(data).select("*").single();
  if (error) throw new Error(`${MODEL_TABLES[model]} create failed: ${error.message}`);
  invalidate();
  return hydrate(model, created as Row, options.select, options.include);
}

async function update(model: string, options: QueryOptions) {
  const where = options.where ?? {};
  const existing = await findUnique(model, { where });
  if (!existing) throw new Prisma.PrismaClientKnownRequestError(`${MODEL_TABLES[model]} record not found`, { code: "P2025" });
  const data = applyConnectedRelations(model, options.data ?? {});
  const { data: updated, error } = await getClient().from(MODEL_TABLES[model]).update(data).eq("id", existing.id).select("*").single();
  if (error) throw new Error(`${MODEL_TABLES[model]} update failed: ${error.message}`);
  invalidate();
  return hydrate(model, updated as Row, options.select, options.include);
}

async function remove(model: string, options: QueryOptions) {
  const existing = await findUnique(model, { where: options.where });
  if (!existing) throw new Prisma.PrismaClientKnownRequestError(`${MODEL_TABLES[model]} record not found`, { code: "P2025" });
  const { data: deleted, error } = await getClient().from(MODEL_TABLES[model]).delete().eq("id", existing.id).select("*").single();
  if (error) throw new Error(`${MODEL_TABLES[model]} delete failed: ${error.message}`);
  invalidate();
  return deleted;
}

async function updateMany(model: string, options: QueryOptions) {
  const rows = (await readRows(model)).filter((row) => matchesWhere(row, options.where));
  if (rows.length === 0) return { count: 0 };
  const data = applyConnectedRelations(model, options.data ?? {});
  const { error } = await getClient().from(MODEL_TABLES[model]).update(data).in("id", rows.map((row) => row.id));
  if (error) throw new Error(`${MODEL_TABLES[model]} updateMany failed: ${error.message}`);
  invalidate();
  return { count: rows.length };
}

async function deleteMany(model: string, options: QueryOptions = {}) {
  const rows = (await readRows(model)).filter((row) => matchesWhere(row, options.where));
  if (rows.length === 0) return { count: 0 };
  const { error } = await getClient().from(MODEL_TABLES[model]).delete().in("id", rows.map((row) => row.id));
  if (error) throw new Error(`${MODEL_TABLES[model]} deleteMany failed: ${error.message}`);
  invalidate();
  return { count: rows.length };
}

async function upsert(model: string, options: QueryOptions & { create: Row; update: Row }) {
  const unique = firstWhereField(options.where);
  const existing = await findUnique(model, { where: options.where });
  if (existing) return update(model, { where: options.where, data: options.update, select: options.select, include: options.include });
  const data = options.create ?? {};
  if (unique && data[unique[0]] === undefined) data[unique[0]] = unique[1];
  return create(model, { data, select: options.select, include: options.include });
}

async function aggregate(model: string, options: QueryOptions & Row = {}) {
  const rows = await findMany(model, { where: options.where });
  const result: Row = {};
  for (const key of ["_count", "_sum", "_avg", "_min", "_max"]) {
    if (!options[key]) continue;
    const fields = Object.keys(options[key]);
    result[key] = {};
    for (const field of fields) {
      const values = rows.map((row) => row[field]).filter((value) => value !== null && value !== undefined);
      if (key === "_count") result[key][field] = values.length;
      else if (values.length === 0) result[key][field] = null;
      else if (key === "_sum") result[key][field] = values.reduce((sum, value) => sum + Number(value), 0);
      else if (key === "_avg") result[key][field] = values.reduce((sum, value) => sum + Number(value), 0) / values.length;
      else if (key === "_min") result[key][field] = values.reduce((min, value) => (value < min ? value : min), values[0]);
      else if (key === "_max") result[key][field] = values.reduce((max, value) => (value > max ? value : max), values[0]);
    }
  }
  return result;
}

async function groupBy(model: string, options: QueryOptions & Row = {}) {
  const by = (options.by ?? []) as string[];
  const rows = await findMany(model, { where: options.where });
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const key = JSON.stringify(by.map((field) => row[field]));
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  return [...groups.values()].map((group) => {
    const result: Row = {};
    for (const field of by) result[field] = group[0][field];
    if (options._count) result._count = { _all: group.length };
    if (options._sum) {
      result._sum = {};
      for (const field of Object.keys(options._sum)) result._sum[field] = group.reduce((sum, row) => sum + Number(row[field] ?? 0), 0);
    }
    return result;
  });
}

function delegate(model: string): ModelDelegate {
  return {
    findMany: (options) => findMany(model, options),
    findUnique: (options) => findUnique(model, options),
    findFirst: (options) => findMany(model, options).then((rows) => rows[0] ?? null),
    count: (options) => findMany(model, { where: options?.where }).then((rows) => rows.length),
    create: (options) => create(model, options),
    update: (options) => update(model, options),
    updateMany: (options) => updateMany(model, options),
    delete: (options) => remove(model, options),
    deleteMany: (options) => deleteMany(model, options),
    upsert: (options) => upsert(model, options),
    aggregate: (options) => aggregate(model, options),
    groupBy: (options) => groupBy(model, options),
  };
}

const facade = new Proxy({} as PrismaFacade, {
  get(_target, property: string) {
    if (property === "$transaction") {
      return async (input: Promise<any>[] | ((tx: PrismaFacade) => Promise<any>)) => {
        if (Array.isArray(input)) return Promise.all(input);
        return input(facade);
      };
    }
    if (property === "$queryRaw") {
      return async () => {
        throw new Error("Raw SQL analytics queries must use Supabase query builders");
      };
    }
    return delegate(property);
  },
});

export const prisma = facade;
