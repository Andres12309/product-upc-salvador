import { Body, Controller, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { Permissions } from '../common/constants/permissions.constant.js';
import { Public } from '../common/decorators/public.decorator.js';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator.js';
import { CatalogService } from './catalog.service.js';
import { CategoryItemDto } from './dto/category-item.dto.js';
import { CategoryTreeDto } from './dto/category-tree.dto.js';
import { LoadSummaryDto } from './dto/load-summary.dto.js';
import { ProductViewDto } from './dto/product-view.dto.js';
import { ProductWriteDto } from './dto/product-write.dto.js';

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Public()
  @Post('load')
  @HttpCode(200)
  load(): Promise<LoadSummaryDto> {
    return this.catalog.load();
  }

  @Get('categories')
  @RequirePermissions(Permissions.CATEGORIES.READ)
  categories(): Promise<CategoryItemDto[]> {
    return this.catalog.categories();
  }

  @Get('categories/:categoryCode/subcategories')
  @RequirePermissions(Permissions.CATEGORIES.READ)
  subcategories(@Param('categoryCode') categoryCode: string): Promise<CategoryTreeDto> {
    return this.catalog.subcategories(categoryCode);
  }

  @Get('products')
  @RequirePermissions(Permissions.PRODUCTS.READ)
  products(): Promise<ProductViewDto[]> {
    return this.catalog.products();
  }

  @Get('products/:id/delete')
  @RequirePermissions(Permissions.PRODUCTS.WRITE)
  remove(@Param('id') id: string): Promise<void> {
    return this.catalog.deleteProduct(id);
  }

  @Get('products/:id')
  @RequirePermissions(Permissions.PRODUCTS.READ)
  product(@Param('id') id: string): Promise<ProductViewDto> {
    return this.catalog.product(id);
  }

  @Post('products')
  @RequirePermissions(Permissions.PRODUCTS.WRITE)
  @HttpCode(201)
  create(@Body() body: ProductWriteDto): Promise<ProductViewDto> {
    return this.catalog.createProduct(body);
  }

  @Put('products/:id')
  @RequirePermissions(Permissions.PRODUCTS.WRITE)
  update(@Param('id') id: string, @Body() body: ProductWriteDto): Promise<ProductViewDto> {
    return this.catalog.updateProduct(id, body);
  }
}
