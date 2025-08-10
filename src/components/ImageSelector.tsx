import { Image } from 'antd';
import classNames from 'classnames';
import { useImageEditorStore } from '../store/imageEditorStore';
import { useImageEditor } from '../hooks/useImageEditor';

const ImageSelector = () => {
    const { imageUrl, setImageUrl, uploadedImages, canvasRef } = useImageEditorStore();
    const { handleLoadImage, handleRemoveCurrentImage } = useImageEditor();

    const toggleSelect = (url: string) => {
        if (!url || !canvasRef) return;
        setImageUrl(url);
        handleLoadImage(url, canvasRef);
        // will remove the old one after load the new one
        if (imageUrl) {
            handleRemoveCurrentImage(imageUrl, canvasRef);
        }
    };

    if (!uploadedImages.length) {
        return <div>No uploaded images</div>;
    }

    return (
        <div className="flex flex-row gap-x-1">
            {uploadedImages.map((url) => (
                <div
                    key={url}
                    className={classNames(
                        'border-2 p-1 transition-all duration-200',
                        imageUrl === url ? 'border-blue-500 shadow-lg' : 'border-gray-300'
                    )}
                    onClick={() => toggleSelect(url)}
                >
                    <Image
                        src={url}
                        alt="image"
                        width={35}
                        height={35}
                        style={{ objectFit: 'cover' }}
                        preview={false}
                    />
                </div>
            ))}
        </div>
    );
};

export default ImageSelector;
 