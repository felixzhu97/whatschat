import { CallEntity, CallType, CallStatus } from '../Call';

describe('CallEntity', () => {
  const createValidCallData = (overrides = {}) => ({
    id: 'call-1',
    callerId: 'caller-1',
    callerName: 'John Caller',
    callerAvatar: 'https://example.com/caller.jpg',
    receiverId: 'receiver-1',
    receiverName: 'Jane Receiver',
    receiverAvatar: 'https://example.com/receiver.jpg',
    type: CallType.Voice as const,
    status: CallStatus.Incoming as const,
    timestamp: new Date('2024-06-15T12:00:00Z'),
    duration: 300,
    isGroupCall: true,
    participants: ['user-1', 'user-2', 'user-3'],
    roomId: 'room-123',
    metadata: { key: 'value' },
    ...overrides,
  });

  describe('constructor', () => {
    it('should create CallEntity with all properties', () => {
      const data = createValidCallData();
      const entity = new CallEntity(data);

      expect(entity.id).toBe('call-1');
      expect(entity.callerId).toBe('caller-1');
      expect(entity.callerName).toBe('John Caller');
      expect(entity.callerAvatar).toBe('https://example.com/caller.jpg');
      expect(entity.receiverId).toBe('receiver-1');
      expect(entity.receiverName).toBe('Jane Receiver');
      expect(entity.receiverAvatar).toBe('https://example.com/receiver.jpg');
      expect(entity.type).toBe(CallType.Voice);
      expect(entity.status).toBe(CallStatus.Incoming);
      expect(entity.timestamp).toBeInstanceOf(Date);
      expect(entity.duration).toBe(300);
      expect(entity.isGroupCall).toBe(true);
      expect(entity.participants).toEqual(['user-1', 'user-2', 'user-3']);
      expect(entity.roomId).toBe('room-123');
      expect(entity.metadata).toEqual({ key: 'value' });
    });

    it('should default isGroupCall to false when undefined', () => {
      const data = createValidCallData({ isGroupCall: undefined });
      const entity = new CallEntity(data);

      expect(entity.isGroupCall).toBe(false);
    });

    it('should default participants to empty array when undefined', () => {
      const data = createValidCallData({ participants: undefined });
      const entity = new CallEntity(data);

      expect(entity.participants).toEqual([]);
    });
  });

  describe('copyWith', () => {
    it('should create a copy with updated properties', () => {
      const original = new CallEntity(createValidCallData());
      const updated = original.copyWith({
        status: CallStatus.Missed,
        duration: 600,
        isGroupCall: false,
      });

      expect(updated.status).toBe(CallStatus.Missed);
      expect(updated.duration).toBe(600);
      expect(updated.isGroupCall).toBe(false);
      expect(updated.id).toBe(original.id);
      expect(updated.callerId).toBe(original.callerId);
    });

    it('should preserve original values when updates are undefined', () => {
      const original = new CallEntity(createValidCallData({ duration: 100 }));
      const copy = original.copyWith({});

      expect(copy.duration).toBe(100);
    });

    it('should create a new instance', () => {
      const original = new CallEntity(createValidCallData());
      const copy = original.copyWith({ status: CallStatus.Declined });

      expect(copy).not.toBe(original);
    });
  });

  describe('toMap', () => {
    it('should convert entity to map with timestamp as milliseconds', () => {
      const entity = new CallEntity(createValidCallData());
      const map = entity.toMap();

      expect(map.id).toBe('call-1');
      expect(map.callerId).toBe('caller-1');
      expect(map.callerName).toBe('John Caller');
      expect(map.receiverId).toBe('receiver-1');
      expect(map.receiverName).toBe('Jane Receiver');
      expect(map.type).toBe(CallType.Voice);
      expect(map.status).toBe(CallStatus.Incoming);
      expect(map.timestamp).toBe(1718452800000);
      expect(map.duration).toBe(300);
      expect(map.isGroupCall).toBe(true);
      expect(map.participants).toEqual(['user-1', 'user-2', 'user-3']);
      expect(map.roomId).toBe('room-123');
    });

    it('should handle undefined optional fields', () => {
      const data = createValidCallData({
        duration: undefined,
        roomId: undefined,
        metadata: undefined,
      });
      const entity = new CallEntity(data);
      const map = entity.toMap();

      expect(map.duration).toBeUndefined();
      expect(map.roomId).toBeUndefined();
      expect(map.metadata).toBeUndefined();
    });
  });

  describe('fromMap', () => {
    it('should create entity from map', () => {
      const map = {
        id: 'call-map-1',
        callerId: 'caller-map-1',
        callerName: 'Map Caller',
        receiverId: 'receiver-map-1',
        receiverName: 'Map Receiver',
        type: 1,
        status: 2,
        timestamp: 1718452800000,
        duration: 450,
        isGroupCall: false,
        participants: ['p1', 'p2'],
        roomId: 'map-room',
      };

      const entity = CallEntity.fromMap(map);

      expect(entity.id).toBe('call-map-1');
      expect(entity.callerId).toBe('caller-map-1');
      expect(entity.callerName).toBe('Map Caller');
      expect(entity.receiverId).toBe('receiver-map-1');
      expect(entity.receiverName).toBe('Map Receiver');
      expect(entity.type).toBe(CallType.Video);
      expect(entity.status).toBe(CallStatus.Missed);
      expect(entity.timestamp).toBeInstanceOf(Date);
      expect(entity.duration).toBe(450);
      expect(entity.isGroupCall).toBe(false);
      expect(entity.participants).toEqual(['p1', 'p2']);
      expect(entity.roomId).toBe('map-room');
    });

    it('should use Voice as default type for invalid type number', () => {
      const map = {
        id: 'call-1',
        callerId: 'caller-1',
        callerName: 'Caller',
        receiverId: 'receiver-1',
        receiverName: 'Receiver',
        type: 999,
        status: 0,
        timestamp: 1718452800000,
      };

      const entity = CallEntity.fromMap(map);

      expect(entity.type).toBe(CallType.Voice);
    });

    it('should use Incoming as default status for invalid status number', () => {
      const map = {
        id: 'call-1',
        callerId: 'caller-1',
        callerName: 'Caller',
        receiverId: 'receiver-1',
        receiverName: 'Receiver',
        type: 0,
        status: 999,
        timestamp: 1718452800000,
      };

      const entity = CallEntity.fromMap(map);

      expect(entity.status).toBe(CallStatus.Incoming);
    });

    it('should default to empty string for missing id', () => {
      const map = {
        callerId: 'caller-1',
        callerName: 'Caller',
        receiverId: 'receiver-1',
        receiverName: 'Receiver',
        type: 0,
        status: 0,
        timestamp: 1718452800000,
      };

      const entity = CallEntity.fromMap(map);

      expect(entity.id).toBe('');
    });

    it('should default to false for missing isGroupCall', () => {
      const map = {
        id: 'call-1',
        callerId: 'caller-1',
        callerName: 'Caller',
        receiverId: 'receiver-1',
        receiverName: 'Receiver',
        type: 0,
        status: 0,
        timestamp: 1718452800000,
      };

      const entity = CallEntity.fromMap(map);

      expect(entity.isGroupCall).toBe(false);
    });

    it('should default to empty array for missing participants', () => {
      const map = {
        id: 'call-1',
        callerId: 'caller-1',
        callerName: 'Caller',
        receiverId: 'receiver-1',
        receiverName: 'Receiver',
        type: 0,
        status: 0,
        timestamp: 1718452800000,
      };

      const entity = CallEntity.fromMap(map);

      expect(entity.participants).toEqual([]);
    });
  });

  describe('type guards', () => {
    it('should return true for isVoiceCall when type is Voice', () => {
      const entity = new CallEntity(createValidCallData({ type: CallType.Voice }));
      expect(entity.isVoiceCall).toBe(true);
      expect(entity.isVideoCall).toBe(false);
    });

    it('should return true for isVideoCall when type is Video', () => {
      const entity = new CallEntity(createValidCallData({ type: CallType.Video }));
      expect(entity.isVoiceCall).toBe(false);
      expect(entity.isVideoCall).toBe(true);
    });
  });

  describe('status guards', () => {
    it('should return true for isIncoming when status is Incoming', () => {
      const entity = new CallEntity(createValidCallData({ status: CallStatus.Incoming }));
      expect(entity.isIncoming).toBe(true);
      expect(entity.isOutgoing).toBe(false);
      expect(entity.isMissed).toBe(false);
      expect(entity.isDeclined).toBe(false);
      expect(entity.isBusy).toBe(false);
      expect(entity.isFailed).toBe(false);
    });

    it('should return true for isOutgoing when status is Outgoing', () => {
      const entity = new CallEntity(createValidCallData({ status: CallStatus.Outgoing }));
      expect(entity.isIncoming).toBe(false);
      expect(entity.isOutgoing).toBe(true);
    });

    it('should return true for isMissed when status is Missed', () => {
      const entity = new CallEntity(createValidCallData({ status: CallStatus.Missed }));
      expect(entity.isMissed).toBe(true);
    });

    it('should return true for isDeclined when status is Declined', () => {
      const entity = new CallEntity(createValidCallData({ status: CallStatus.Declined }));
      expect(entity.isDeclined).toBe(true);
    });

    it('should return true for isBusy when status is Busy', () => {
      const entity = new CallEntity(createValidCallData({ status: CallStatus.Busy }));
      expect(entity.isBusy).toBe(true);
    });

    it('should return true for isFailed when status is Failed', () => {
      const entity = new CallEntity(createValidCallData({ status: CallStatus.Failed }));
      expect(entity.isFailed).toBe(true);
    });
  });

  describe('durationString', () => {
    it('should return empty string when duration is undefined', () => {
      const entity = new CallEntity(createValidCallData({ duration: undefined }));
      expect(entity.durationString).toBe('');
    });

    it('should return seconds only when less than 60 seconds', () => {
      const entity = new CallEntity(createValidCallData({ duration: 45 }));
      expect(entity.durationString).toBe('45s');
    });

    it('should return formatted string with minutes and seconds', () => {
      const entity = new CallEntity(createValidCallData({ duration: 125 }));
      expect(entity.durationString).toBe('2:05');
    });

    it('should handle exactly 60 seconds', () => {
      const entity = new CallEntity(createValidCallData({ duration: 60 }));
      expect(entity.durationString).toBe('1:00');
    });

    it('should handle large durations', () => {
      const entity = new CallEntity(createValidCallData({ duration: 3665 }));
      expect(entity.durationString).toBe('61:05');
    });
  });

  describe('toString', () => {
    it('should return formatted string', () => {
      const entity = new CallEntity(createValidCallData());
      const str = entity.toString();

      expect(str).toContain('call-1');
      expect(str).toContain('voice');
      expect(str).toContain('incoming');
      expect(str).toContain('300');
    });
  });

  describe('equals', () => {
    it('should return true for same id', () => {
      const entity = new CallEntity(createValidCallData({ id: 'same-id' }));
      const other = createValidCallData({ id: 'same-id' });

      expect(entity.equals(other)).toBe(true);
    });

    it('should return false for different id', () => {
      const entity = new CallEntity(createValidCallData({ id: 'id-1' }));
      const other = createValidCallData({ id: 'id-2' });

      expect(entity.equals(other)).toBe(false);
    });
  });
});
