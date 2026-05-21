import { Controller, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

/**
 * Generic upload endpoints used by every admin form (CMS images, banners,
 * news images, gallery images, etc.). Returns a relative URL that the caller
 * can store in the corresponding table column.
 */
@Controller('uploads')
@UseGuards(AuthGuard('jwt'))
export class UploadController {
  @Post('one')
  @UseInterceptors(FileInterceptor('file'))
  one(@UploadedFile() file: Express.Multer.File) {
    return toResult(file);
  }

  @Post('many')
  @UseInterceptors(FilesInterceptor('files', 25))
  many(@UploadedFiles() files: Express.Multer.File[]) {
    return files.map(toResult);
  }
}

function toResult(file: Express.Multer.File) {
  const folder = file.destination.endsWith('images') ? 'images' : 'docs';
  return {
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    url: `/files/${folder}/${file.filename}`,
  };
}
