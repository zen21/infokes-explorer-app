import { Folder, File } from '@file-explorer/shared';

export abstract class Entity<T> {
  protected readonly _id: string;
  public readonly props: T;

  constructor(props: T, id?: string) {
    this._id = id || crypto.randomUUID();
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  public equals(object?: Entity<T>): boolean {
    if (object === null || object === undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    return this._id === object._id;
  }
}

export class FolderEntity extends Entity<Folder> {
  get name(): string {
    return this.props.name;
  }

  get parentId(): string | null {
    return this.props.parentId;
  }

  get path(): string {
    return this.props.path;
  }

  private constructor(props: Folder, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<Folder, 'id'>, id?: string): FolderEntity {
    const folder: Folder = {
      ...props,
      id: id || crypto.randomUUID(),
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };
    return new FolderEntity(folder, id);
  }
}

export class FileEntity extends Entity<File> {
  get name(): string {
    return this.props.name;
  }

  get folderId(): string {
    return this.props.folderId;
  }

  get size(): number {
    return this.props.size;
  }

  get type(): string {
    return this.props.type;
  }

  private constructor(props: File, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<File, 'id'>, id?: string): FileEntity {
    const file: File = {
      ...props,
      id: id || crypto.randomUUID(),
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };
    return new FileEntity(file, id);
  }
}