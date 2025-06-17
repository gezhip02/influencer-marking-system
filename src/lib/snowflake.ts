/**
 * 雪花算法ID生成器
 * 生成64位数值ID，保证全局唯一性
 * 
 * 64位ID结构：
 * 1位符号位(固定0) + 41位时间戳 + 10位机器ID + 12位序列号
 */

class SnowflakeGenerator {
  private epoch: bigint; // 自定义起始时间戳 (2024-01-01 00:00:00 UTC)
  private machineId: bigint; // 机器ID (0-1023)
  private sequence: bigint = 0n; // 序列号 (0-4095)
  private lastTimestamp: bigint = 0n; // 上次生成ID的时间戳

  // 位数分配
  private readonly machineBits = 10n; // 机器ID位数
  private readonly sequenceBits = 12n; // 序列号位数
  
  // 最大值
  private readonly maxMachineId = (1n << this.machineBits) - 1n; // 1023
  private readonly maxSequence = (1n << this.sequenceBits) - 1n; // 4095
  
  // 位移
  private readonly machineShift = this.sequenceBits; // 12
  private readonly timestampShift = this.sequenceBits + this.machineBits; // 22

  constructor(machineId: number = 1) {
    // 自定义起始时间戳 (2024-01-01 00:00:00 UTC)
    this.epoch = BigInt(new Date('2024-01-01T00:00:00Z').getTime());
    
    // 验证机器ID
    this.machineId = BigInt(machineId);
    if (this.machineId < 0n || this.machineId > this.maxMachineId) {
      throw new Error(`Machine ID must be between 0 and ${this.maxMachineId}`);
    }
  }

  /**
   * 生成下一个ID
   */
  nextId(): bigint {
    let timestamp = this.getCurrentTimestamp();

    // 时钟回拨检测
    if (timestamp < this.lastTimestamp) {
      throw new Error(`Clock moved backwards. Refusing to generate id for ${this.lastTimestamp - timestamp} milliseconds`);
    }

    // 如果是同一毫秒内，序列号递增
    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & this.maxSequence;
      
      // 序列号溢出，等待下一毫秒
      if (this.sequence === 0n) {
        timestamp = this.waitNextMillis(this.lastTimestamp);
      }
    } else {
      // 新的毫秒，序列号重置
      this.sequence = 0n;
    }

    this.lastTimestamp = timestamp;

    // 组装64位ID
    return ((timestamp - this.epoch) << this.timestampShift) |
           (this.machineId << this.machineShift) |
           this.sequence;
  }

  /**
   * 生成字符串格式的ID
   */
  nextIdString(): string {
    return this.nextId().toString();
  }

  /**
   * 获取当前时间戳
   */
  private getCurrentTimestamp(): bigint {
    return BigInt(Date.now());
  }

  /**
   * 等待下一毫秒
   */
  private waitNextMillis(lastTimestamp: bigint): bigint {
    let timestamp = this.getCurrentTimestamp();
    while (timestamp <= lastTimestamp) {
      timestamp = this.getCurrentTimestamp();
    }
    return timestamp;
  }

  /**
   * 解析ID获取时间戳
   */
  parseTimestamp(id: bigint): Date {
    const timestamp = (id >> this.timestampShift) + this.epoch;
    return new Date(Number(timestamp));
  }

  /**
   * 解析ID获取机器ID
   */
  parseMachineId(id: bigint): number {
    return Number((id >> this.machineShift) & this.maxMachineId);
  }

  /**
   * 解析ID获取序列号
   */
  parseSequence(id: bigint): number {
    return Number(id & this.maxSequence);
  }
}

// 创建默认实例
const snowflake = new SnowflakeGenerator(
  // 使用环境变量或默认机器ID
  parseInt(process.env.MACHINE_ID || '1')
);

export default snowflake;
export { SnowflakeGenerator };

// 便捷方法
export const generateId = (): bigint => snowflake.nextId();
export const generateIdString = (): string => snowflake.nextIdString(); 