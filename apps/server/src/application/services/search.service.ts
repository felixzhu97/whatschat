import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "../../infrastructure/database/elasticsearch.service";

@Injectable()
export class SearchService {
  constructor(private readonly es: ElasticsearchService) {}

  async searchUsers(q: string, limit: number) {
    const client = this.es.getClient();
    if (!client) return { hits: [] };
    const result = await client.search({
      index: "users",
      query: { multi_match: { query: q, fields: ["username", "id"], fuzziness: "AUTO" } },
      size: limit,
    });
    return {
      hits: (result.hits.hits || []).map((h) => ({ id: (h as any)._id, ...(h as any)._source })),
    };
  }

  async searchPosts(q: string, limit: number) {
    const client = this.es.getClient();
    if (!client) return { hits: [] };
    const result = await client.search({
      index: "posts",
      query: { multi_match: { query: q, fields: ["caption", "hashtags"], fuzziness: "AUTO" } },
      size: limit,
      sort: [{ createdAt: { order: "desc" } }],
    });
    return {
      hits: (result.hits.hits || []).map((h) => ({ id: (h as any)._id, ...(h as any)._source })),
    };
  }

  async searchHashtags(q: string, limit: number) {
    const client = this.es.getClient();
    if (!client) return { hits: [] };
    const result = await client.search({
      index: "hashtags",
      query: { prefix: { tag: q.replace(/^#/, "") } },
      size: limit,
    });
    return {
      hits: (result.hits.hits || []).map((h) => (h as any)._source),
    };
  }
}
