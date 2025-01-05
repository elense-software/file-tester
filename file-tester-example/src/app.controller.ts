import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    Post, Query,
    StreamableFile,
    UploadedFiles,
    UseInterceptors
} from '@nestjs/common';
import {AppService} from './app.service';
import {FilesInterceptor} from "@nestjs/platform-express";
import {ApiBody, ApiConsumes, ApiParam, ApiQuery, ApiResponse} from "@nestjs/swagger";
import {v4 as uuid} from 'uuid'

@Controller()
export class AppController {
    private readonly fileStorage: Record<string, Express.Multer.File> = {}

    constructor(private readonly appService: AppService) {
    }

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Post('upload')
    @UseInterceptors(FilesInterceptor('data'))
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: Object,
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'string',
                    format: 'binary',
                },
            },
            required: ['data'],
        },
    })
    async upload(
        @UploadedFiles() [file]: Express.Multer.File[],
    ): Promise<{ fileId: string }> {
        const fileId: string = uuid()

        this.fileStorage[fileId] = file

        return {
            fileId: fileId
        }
    }

    @Get('download')
    @ApiQuery({
        name: 'output-file-name',
        type: 'string'
    })
    @ApiQuery({
        name: 'fileId',
        description: 'The ID of the file',
        type: 'string',
        required: true,
        example: 'a6c9e0d5-7d7f-4a2c-8f7a-5f9f6e4c3c8d',
    })
    async download(
        @Query('fileId') fileId: string,
        @Query('outputFileName') outputFileName: string,
    ): Promise<StreamableFile> {
        const file = this.fileStorage[fileId]

        return new StreamableFile(file.buffer, {
            type: 'application/octet-stream',
            disposition: `attachment; filename="${outputFileName || file.originalname}"`,
        })
    }
}
