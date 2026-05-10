import { StatusEntity, StatusType, StatusPrivacy } from '../Status';

describe('StatusEntity', () => {
  const createValidStatusData = (overrides = {}) => ({
    id: 'status-1',
    userId: 'user-1',
    userName: 'John Doe',
    userAvatar: 'https://example.com/avatar.jpg',
    content: 'Hello from status!',
    type: StatusType.Text as const,
    mediaUrl: 'https://example.com/media.jpg',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    backgroundColor: '#FF0000',
    textColor: '#FFFFFF',
    fontFamily: 'Arial',
    fontSize: 16,
    duration: 24,
    timestamp: new Date('2024-06-15T12:00:00Z'),
    expiresAt: new Date('2024-06-16T12:00:00Z'),
    privacy: StatusPrivacy.Contacts as const,
    allowedViewers: ['user-2', 'user-3'],
    blockedViewers: ['user-4'],
    viewers: ['user-5', 'user-6'],
    metadata: { key: 'value' },
    ...overrides,
  });

  describe('constructor', () => {
    it('should create StatusEntity with all properties', () => {
      const data = createValidStatusData();
      const entity = new StatusEntity(data);

      expect(entity.id).toBe('status-1');
      expect(entity.userId).toBe('user-1');
      expect(entity.userName).toBe('John Doe');
      expect(entity.userAvatar).toBe('https://example.com/avatar.jpg');
      expect(entity.content).toBe('Hello from status!');
      expect(entity.type).toBe(StatusType.Text);
      expect(entity.mediaUrl).toBe('https://example.com/media.jpg');
      expect(entity.thumbnailUrl).toBe('https://example.com/thumb.jpg');
      expect(entity.backgroundColor).toBe('#FF0000');
      expect(entity.textColor).toBe('#FFFFFF');
      expect(entity.fontFamily).toBe('Arial');
      expect(entity.fontSize).toBe(16);
      expect(entity.duration).toBe(24);
      expect(entity.timestamp).toBeInstanceOf(Date);
      expect(entity.expiresAt).toBeInstanceOf(Date);
      expect(entity.privacy).toBe(StatusPrivacy.Contacts);
      expect(entity.allowedViewers).toEqual(['user-2', 'user-3']);
      expect(entity.blockedViewers).toEqual(['user-4']);
      expect(entity.viewers).toEqual(['user-5', 'user-6']);
      expect(entity.metadata).toEqual({ key: 'value' });
    });

    it('should default privacy to Contacts when undefined', () => {
      const data = createValidStatusData({ privacy: undefined });
      const entity = new StatusEntity(data);

      expect(entity.privacy).toBe(StatusPrivacy.Contacts);
    });

    it('should default allowedViewers to empty array when undefined', () => {
      const data = createValidStatusData({ allowedViewers: undefined });
      const entity = new StatusEntity(data);

      expect(entity.allowedViewers).toEqual([]);
    });

    it('should default blockedViewers to empty array when undefined', () => {
      const data = createValidStatusData({ blockedViewers: undefined });
      const entity = new StatusEntity(data);

      expect(entity.blockedViewers).toEqual([]);
    });

    it('should default viewers to empty array when undefined', () => {
      const data = createValidStatusData({ viewers: undefined });
      const entity = new StatusEntity(data);

      expect(entity.viewers).toEqual([]);
    });
  });

  describe('copyWith', () => {
    it('should create a copy with updated properties', () => {
      const original = new StatusEntity(createValidStatusData());
      const updated = original.copyWith({
        content: 'Updated status',
        type: StatusType.Image,
        privacy: StatusPrivacy.ContactsExcept,
      });

      expect(updated.content).toBe('Updated status');
      expect(updated.type).toBe(StatusType.Image);
      expect(updated.privacy).toBe(StatusPrivacy.ContactsExcept);
      expect(updated.id).toBe(original.id);
      expect(updated.userId).toBe(original.userId);
    });

    it('should preserve original values when updates are undefined', () => {
      const original = new StatusEntity(createValidStatusData({ content: 'Original' }));
      const copy = original.copyWith({});

      expect(copy.content).toBe('Original');
    });

    it('should create a new instance', () => {
      const original = new StatusEntity(createValidStatusData());
      const copy = original.copyWith({ content: 'New' });

      expect(copy).not.toBe(original);
    });
  });

  describe('toMap', () => {
    it('should convert entity to map with timestamp as milliseconds', () => {
      const entity = new StatusEntity(createValidStatusData());
      const map = entity.toMap();

      expect(map.id).toBe('status-1');
      expect(map.userId).toBe('user-1');
      expect(map.userName).toBe('John Doe');
      expect(map.content).toBe('Hello from status!');
      expect(map.type).toBe(StatusType.Text);
      expect(map.timestamp).toBe(1718452800000);
      expect(map.expiresAt).toBe(1718539200000);
      expect(map.privacy).toBe(StatusPrivacy.Contacts);
      expect(map.allowedViewers).toEqual(['user-2', 'user-3']);
      expect(map.blockedViewers).toEqual(['user-4']);
      expect(map.viewers).toEqual(['user-5', 'user-6']);
    });
  });

  describe('fromMap', () => {
    it('should create entity from map', () => {
      const map = {
        id: 'status-map-1',
        userId: 'user-map-1',
        userName: 'Map User',
        content: 'Status from map',
        type: 1,
        mediaUrl: 'https://example.com/map-media.jpg',
        timestamp: 1718452800000,
        expiresAt: 1718539200000,
        privacy: 1,
        allowedViewers: ['user-a'],
        blockedViewers: ['user-b'],
        viewers: ['user-c'],
      };

      const entity = StatusEntity.fromMap(map);

      expect(entity.id).toBe('status-map-1');
      expect(entity.userId).toBe('user-map-1');
      expect(entity.userName).toBe('Map User');
      expect(entity.content).toBe('Status from map');
      expect(entity.type).toBe(StatusType.Image);
      expect(entity.mediaUrl).toBe('https://example.com/map-media.jpg');
      expect(entity.timestamp).toBeInstanceOf(Date);
      expect(entity.expiresAt).toBeInstanceOf(Date);
      expect(entity.privacy).toBe(StatusPrivacy.ContactsExcept);
      expect(entity.allowedViewers).toEqual(['user-a']);
      expect(entity.blockedViewers).toEqual(['user-b']);
      expect(entity.viewers).toEqual(['user-c']);
    });

    it('should use Text as default type for invalid type number', () => {
      const map = {
        id: 'status-1',
        userId: 'user-1',
        userName: 'Name',
        content: 'Content',
        type: 999,
        timestamp: 1718452800000,
        expiresAt: 1718539200000,
      };

      const entity = StatusEntity.fromMap(map);

      expect(entity.type).toBe(StatusType.Text);
    });

    it('should use Contacts as default privacy for invalid privacy number', () => {
      const map = {
        id: 'status-1',
        userId: 'user-1',
        userName: 'Name',
        content: 'Content',
        privacy: 999,
        timestamp: 1718452800000,
        expiresAt: 1718539200000,
      };

      const entity = StatusEntity.fromMap(map);

      expect(entity.privacy).toBe(StatusPrivacy.Contacts);
    });

    it('should default to empty arrays for non-array viewer fields', () => {
      const map = {
        id: 'status-1',
        userId: 'user-1',
        userName: 'Name',
        content: 'Content',
        timestamp: 1718452800000,
        expiresAt: 1718539200000,
        allowedViewers: 'not-an-array',
        blockedViewers: 'not-an-array',
        viewers: 'not-an-array',
      };

      const entity = StatusEntity.fromMap(map);

      expect(entity.allowedViewers).toEqual([]);
      expect(entity.blockedViewers).toEqual([]);
      expect(entity.viewers).toEqual([]);
    });
  });

  describe('type guards', () => {
    it('should return true for isText when type is Text', () => {
      const entity = new StatusEntity(createValidStatusData({ type: StatusType.Text }));
      expect(entity.isText).toBe(true);
      expect(entity.isImage).toBe(false);
      expect(entity.isVideo).toBe(false);
    });

    it('should return true for isImage when type is Image', () => {
      const entity = new StatusEntity(createValidStatusData({ type: StatusType.Image }));
      expect(entity.isText).toBe(false);
      expect(entity.isImage).toBe(true);
      expect(entity.isVideo).toBe(false);
    });

    it('should return true for isVideo when type is Video', () => {
      const entity = new StatusEntity(createValidStatusData({ type: StatusType.Video }));
      expect(entity.isText).toBe(false);
      expect(entity.isImage).toBe(false);
      expect(entity.isVideo).toBe(true);
    });
  });

  describe('isExpired', () => {
    it('should return true when current date is after expiresAt', () => {
      const entity = new StatusEntity(
        createValidStatusData({
          expiresAt: new Date('2020-01-01T00:00:00Z'),
        }),
      );

      expect(entity.isExpired).toBe(true);
    });

    it('should return false when current date is before expiresAt', () => {
      const entity = new StatusEntity(
        createValidStatusData({
          expiresAt: new Date('2099-12-31T23:59:59Z'),
        }),
      );

      expect(entity.isExpired).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return formatted string', () => {
      const entity = new StatusEntity(createValidStatusData());
      const str = entity.toString();

      expect(str).toContain('status-1');
      expect(str).toContain('user-1');
      expect(str).toContain('text');
    });
  });

  describe('equals', () => {
    it('should return true for same id', () => {
      const entity = new StatusEntity(createValidStatusData({ id: 'same-id' }));
      const other = createValidStatusData({ id: 'same-id' });

      expect(entity.equals(other)).toBe(true);
    });

    it('should return false for different id', () => {
      const entity = new StatusEntity(createValidStatusData({ id: 'id-1' }));
      const other = createValidStatusData({ id: 'id-2' });

      expect(entity.equals(other)).toBe(false);
    });
  });
});
