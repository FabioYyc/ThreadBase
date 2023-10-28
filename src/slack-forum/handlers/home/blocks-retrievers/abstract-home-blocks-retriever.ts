// Purpose: Abstract class for home blocks retrievers. to return different views for home tab.
export abstract class AbstractHomeBlocks {
  public abstract getBlocks(orgId: string): Promise<any[]> | any[];
}
