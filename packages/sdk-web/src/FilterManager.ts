import { EventEmitter } from "@whatschat/sdk-communication";
import {
  IFilterManager,
  FilterConfig,
  FilterChain,
  FilterState,
} from "@whatschat/sdk-processing/filter";

export class FilterManager extends EventEmitter implements IFilterManager {
  private filters: FilterConfig[] = [];
  private state: FilterState = FilterState.Idle;

  async applyFilter(config: FilterConfig): Promise<void> {
    const index = this.filters.findIndex((f) => f.type === config.type);
    if (index >= 0) {
      this.filters[index] = config;
    } else {
      this.filters.push(config);
    }
    this.emit("filter-applied", config);
  }

  async removeFilter(type: string): Promise<void> {
    this.filters = this.filters.filter((f) => f.type !== type);
    this.emit("filter-removed", type);
  }

  async applyFilterChain(chain: FilterChain): Promise<void> {
    this.filters = [...chain];
    chain.forEach((config) => {
      this.emit("filter-applied", config);
    });
  }

  async clearFilters(): Promise<void> {
    this.filters.forEach((f) => {
      this.emit("filter-removed", f.type);
    });
    this.filters = [];
  }

  async toggleFilter(type: string, enabled: boolean): Promise<void> {
    const filter = this.filters.find((f) => f.type === type);
    if (filter) {
      filter.enabled = enabled;
      this.emit("filter-applied", filter);
    }
  }

  getActiveFilters(): FilterConfig[] {
    return this.filters.filter((f) => f.enabled);
  }

  getFilterState(): FilterState {
    return this.state;
  }

  async processVideoFrame(frame: VideoFrame): Promise<VideoFrame | null> {
    // TODO: Implement Canvas/WebGL filter processing
    this.setState(FilterState.Processing);
    return frame;
  }

  processVideoStream(stream: MediaStream): MediaStream {
    // TODO: Implement stream filter processing using Canvas/WebGL
    return stream;
  }

  private setState(state: FilterState) {
    this.state = state;
    this.emit("filter-state-change", state);
  }
}
