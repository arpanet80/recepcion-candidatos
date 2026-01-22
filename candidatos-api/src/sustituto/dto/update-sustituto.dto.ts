import { PartialType } from '@nestjs/mapped-types';
import { CreateSustitutoDto } from './create-sustituto.dto';

export class UpdateSustitutoDto extends PartialType(CreateSustitutoDto) {}