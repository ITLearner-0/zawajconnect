
import { CompatibilityMatch } from "@/types/compatibility";
import { PaginationCursor, PaginationOptions, PaginatedResult } from "../types/paginationTypes";
import { logInfo, logError } from "./loggingService";

export class PaginationService {
  private static readonly DEFAULT_PAGE_SIZE = 20;
  private static readonly MAX_PAGE_SIZE = 100;

  // Create pagination cursor from match
  static createCursor(match: CompatibilityMatch): PaginationCursor {
    return {
      score: match.score ?? match.compatibilityScore ?? 0,
      userId: match.userId,
      timestamp: Date.now()
    };
  }

  // Paginate matches array
  static paginateMatches(
    matches: CompatibilityMatch[], 
    options: PaginationOptions = {}
  ): PaginatedResult<CompatibilityMatch> {
    try {
      const limit = Math.min(
        options.limit || this.DEFAULT_PAGE_SIZE, 
        this.MAX_PAGE_SIZE
      );
      
      let startIndex = 0;
      
      // Find cursor position if provided
      if (options.cursor) {
        const cursorIndex = matches.findIndex(match => 
          match.userId === options.cursor!.userId
        );
        
        if (cursorIndex !== -1) {
          startIndex = options.direction === 'backward' 
            ? Math.max(0, cursorIndex - limit + 1)
            : cursorIndex + 1;
        }
      }

      const endIndex = Math.min(startIndex + limit, matches.length);
      const data = matches.slice(startIndex, endIndex);
      
      const result: PaginatedResult<CompatibilityMatch> = {
        data,
        hasMore: endIndex < matches.length,
        totalCount: matches.length
      };

      // Set cursors
      if (data.length > 0) {
        const lastItem = data[data.length - 1];
        const firstItem = data[0];
        if (lastItem) {
          result.nextCursor = this.createCursor(lastItem);
        }
        if (startIndex > 0 && firstItem) {
          result.prevCursor = this.createCursor(firstItem);
        }
      }

      logInfo('paginationService', 'Paginated matches', {
        startIndex,
        endIndex,
        dataLength: data.length,
        hasMore: result.hasMore
      });

      return result;
    } catch (error) {
      logError('paginationService', error as Error);
      return {
        data: [],
        hasMore: false,
        totalCount: 0
      };
    }
  }

  // Merge paginated results (for "load more" functionality)
  static mergeResults(
    existing: CompatibilityMatch[], 
    newData: CompatibilityMatch[]
  ): CompatibilityMatch[] {
    const existingIds = new Set(existing.map(match => match.userId));
    const uniqueNewData = newData.filter(match => !existingIds.has(match.userId));
    
    return [...existing, ...uniqueNewData];
  }

  // Calculate virtual scroll items
  static calculateVisibleItems(
    itemHeight: number,
    containerHeight: number,
    scrollTop: number,
    totalItems: number,
    overscan = 5
  ) {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      totalItems - 1
    );

    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(totalItems - 1, visibleEnd + overscan);

    return {
      start,
      end,
      visibleStart,
      visibleEnd
    };
  }
}

export const paginationService = new PaginationService();
