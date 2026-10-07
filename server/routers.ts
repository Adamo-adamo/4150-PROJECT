import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";

const modeSchema = z.enum(["masters", "career"]);
const viewSchema = z.enum(["all", "shortlisted"]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  workspace: router({
    me: protectedProcedure.query(({ ctx }) => ({
      ownerId: ctx.user.id,
      name: "Jordan's application desk",
      mode: "masters" as const,
      fictional: true,
    })),
    setMode: protectedProcedure.input(z.object({ mode: modeSchema })).mutation(({ input }) => ({ success: true, mode: input.mode })),
    summary: protectedProcedure.input(z.object({ mode: modeSchema, view: viewSchema.optional() })).query(({ input }) => ({
      mode: input.mode,
      view: input.view ?? "all",
      source: "fictional-seed",
      counts: { applications: input.mode === "masters" ? 3 : 3, dueSoon: 2, openTasks: 4, readiness: 68 },
    })),
  }),
  applications: router({
    list: protectedProcedure.input(z.object({ mode: modeSchema, search: z.string().optional(), shortlistedOnly: z.boolean().optional() })).query(({ input }) => ({ mode: input.mode, search: input.search ?? "", shortlistedOnly: Boolean(input.shortlistedOnly), source: "fictional-seed" })),
    compare: protectedProcedure.input(z.object({ mode: modeSchema, ids: z.array(z.string()).min(2).max(4) })).query(({ input }) => ({ mode: input.mode, ids: input.ids, source: "fictional-seed" })),
    create: protectedProcedure.input(z.object({ mode: modeSchema, kind: z.enum(["Programme", "Graduate role"]), organization: z.string().min(1), title: z.string().min(1), deadline: z.string() })).mutation(({ input }) => ({ id: `demo-${Date.now()}`, ...input, fictional: true })),
    update: protectedProcedure.input(z.object({ id: z.string(), status: z.string().optional(), shortlisted: z.boolean().optional(), progress: z.number().min(0).max(100).optional() })).mutation(({ input }) => ({ success: true, ...input })),
    remove: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ input }) => ({ success: true, id: input.id })),
  }),
  requirements: router({
    list: protectedProcedure.input(z.object({ applicationId: z.string() })).query(({ input }) => ({ applicationId: input.applicationId, source: "fictional-seed" })),
    updateState: protectedProcedure.input(z.object({ id: z.string(), state: z.enum(["Ready", "In progress", "Missing"]) })).mutation(({ input }) => ({ success: true, ...input })),
  }),
  tasks: router({
    list: protectedProcedure.input(z.object({ mode: modeSchema, state: z.string().optional() })).query(({ input }) => ({ mode: input.mode, state: input.state ?? "All", source: "fictional-seed" })),
    toggle: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ input }) => ({ success: true, id: input.id })),
  }),
  documents: router({
    list: protectedProcedure.query(() => ({ source: "fictional-seed" })),
    link: protectedProcedure.input(z.object({ applicationId: z.string(), documentId: z.string() })).mutation(({ input }) => ({ success: true, ...input })),
    unlink: protectedProcedure.input(z.object({ applicationId: z.string(), documentId: z.string() })).mutation(({ input }) => ({ success: true, ...input })),
  }),
  deadlines: router({
    list: protectedProcedure.input(z.object({ mode: modeSchema })).query(({ input }) => ({ mode: input.mode, source: "fictional-seed" })),
  }),
  adviser: router({
    review: protectedProcedure.query(() => ({ demo: true, reviewer: "Maya Chen", source: "fictional-seed" })),
  }),
  billing: router({
    status: protectedProcedure.query(() => ({ plan: "Free planning", status: "demo", testOnly: true })),
    startTestUpgrade: protectedProcedure.input(z.object({ plan: z.enum(["One-season pass", "Adviser / university"]) })).mutation(({ input }) => ({ success: true, plan: input.plan, status: "test" })),
  }),
});

export type AppRouter = typeof appRouter;
