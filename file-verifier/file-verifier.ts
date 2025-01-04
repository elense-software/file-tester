export interface FileVerifier {
    verify(actualFile: Buffer, params: any): Promise<void>
}
