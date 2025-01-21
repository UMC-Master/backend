import { TipRepository } from '../repositories/tip.repository.js';
import { toTipDto } from '../dtos/tip.dto.js';
import { ValidationError } from '../errors'; // 에러 클래스 추가

export class TipService {
  private tipRepository: TipRepository;

  constructor() {
    this.tipRepository = new TipRepository();
  }

  // 팁 생성
  public async createTip(userId: number, title: string, content: string) {
    const existingTip = await this.tipRepository.getTipByTitle(title);
    if (existingTip) {
      throw new ValidationError('Duplicate tip title', { title });
    }

    const newTip = await this.tipRepository.createTip({ userId, title, content });
    return toTipDto(newTip);
  }

  // 팁 수정
  public async updateTip(tipId: number, title: string, content: string) {
    const updatedTip = await this.tipRepository.updateTip(tipId, title, content);
    return toTipDto(updatedTip);
  }

  // 팁 삭제
  public async deleteTip(tipId: number) {
    await this.tipRepository.deleteTip(tipId);
    return { isSuccess: true, message: 'Tip successfully deleted' };
  }
}
