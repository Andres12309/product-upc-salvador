import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

function text(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function code(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

export class ProductWriteDto {
  @Transform(({ value }: { value: unknown }) => text(value))
  @IsString({ message: 'El nombre es obligatorio.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  upcDescription: string;

  @Transform(({ value }: { value: unknown }) => text(value))
  @Matches(/^\d{12}$/, { message: 'El UPC debe tener 12 dígitos.' })
  @IsNotEmpty({ message: 'El UPC es obligatorio.' })
  @IsString({ message: 'El UPC es obligatorio.' })
  upcCode: string;

  @Transform(({ value }: { value: unknown }) => code(value))
  @IsString({ message: 'La categoría es obligatoria.' })
  @IsNotEmpty({ message: 'La categoría es obligatoria.' })
  categoryCode: string;

  @Transform(({ value }: { value: unknown }) => code(value))
  @IsString({ message: 'La subcategoría es obligatoria.' })
  @IsNotEmpty({ message: 'La subcategoría es obligatoria.' })
  subCategoryCode: string;

  @IsString({ message: 'La fecha no es válida.' })
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, { message: 'La fecha no es válida.' })
  dateAdded: string;

  @IsString({ message: 'La fecha no es válida.' })
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, { message: 'La fecha no es válida.' })
  updatedDate: string;

  @Transform(({ value }: { value: unknown }) => text(value))
  @IsString({ message: 'Indica quién registró el producto.' })
  @IsNotEmpty({ message: 'Indica quién registró el producto.' })
  addedBy: string;

  @Transform(({ value }: { value: unknown }) => text(value))
  @IsString({ message: 'Indica quién modificó el producto.' })
  @IsNotEmpty({ message: 'Indica quién modificó el producto.' })
  modifiedBy: string;

  @IsOptional()
  @IsString()
  token?: string;
}
