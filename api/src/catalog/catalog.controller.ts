import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { Permissions } from '../common/constants/permissions.constant.js';
import { Public } from '../common/decorators/public.decorator.js';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator.js';
import { CatalogService } from './catalog.service.js';
import { CategoryTreeDto } from './dto/category-tree.dto.js';
import { LoadSummaryDto } from './dto/load-summary.dto.js';

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Public()
  @Post('load')
  @HttpCode(200)
  load(): Promise<LoadSummaryDto> {
    return this.catalog.load();
  }

  @Get('categories/:categoryCode/subcategories')
  @RequirePermissions(Permissions.CATEGORIES.READ)
  subcategories(@Param('categoryCode') categoryCode: string): Promise<CategoryTreeDto> {
    return this.catalog.subcategories(categoryCode);
  }
}
