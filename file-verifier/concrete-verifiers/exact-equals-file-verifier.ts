import {FileVerifier} from "../file-verifier";

export class DefaultFileVerifier implements FileVerifier {
    async verify(actualFile: Buffer): Promise<void> {
        // verify file is not empty
    }
}
