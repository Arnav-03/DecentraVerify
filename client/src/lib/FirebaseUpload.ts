import { ref, uploadBytesResumable, getDownloadURL, getStorage } from 'firebase/storage';
import { toast } from 'sonner';
import { app } from './FirebaseConfig';
import { FirebaseError } from 'firebase/app'; // Import the FirebaseError type

export const uploadPhoto = async (file: File, rollno: string, certificateID: string): Promise<string> => {
    const storage = getStorage(app);
    const fileName = `${certificateID}-${rollno}--${Date.now()}.pdf`; 
    const metadata = { contentType: file.type }; 
    const storageRef = ref(storage, `DecentraVerify/${fileName}`);

    try {
        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        return new Promise<string>((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const fileProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${fileProgress}% done`);
                },
                (error: FirebaseError) => { // Use FirebaseError type here
                    toast.error('Upload failed');
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    } catch (error) {
        toast.error("Error uploading the file");
        throw error;
    }
};
