type ShippingBarcodeProps = {
    value: string;
};

export default function ShippingBarcode({ value }: ShippingBarcodeProps) {
    if (!value) {
        return (
            <div className="flex h-12 items-center justify-center bg-white text-xs text-black">
                SHIPMENT NOT CREATED
            </div>
        );
    }

    const barcodeUrl = new URL("https://bwipjs-api.metafloor.com/");
    barcodeUrl.searchParams.set("bcid", "code128");
    barcodeUrl.searchParams.set("text", value);
    barcodeUrl.searchParams.set("scale", "3");
    barcodeUrl.searchParams.set("height", "14");
    barcodeUrl.searchParams.set("padding", "2");
    barcodeUrl.searchParams.set("backgroundcolor", "FFFFFF");

    return (
        <img
            src={barcodeUrl.toString()}
            alt="Scannable parcel barcode"
            className="block h-12 w-full bg-white object-fill px-1 py-1"
        />
    );
}
