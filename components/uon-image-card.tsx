import Image from "next/image";

const UON_IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/e/e5/Nottingham%2C_Trent_Building.jpg";
const UON_IMAGE_SOURCE = "https://commons.wikimedia.org/wiki/File:Nottingham,_Trent_Building.jpg";

type UonImageCardProps = {
  caption?: string;
};

export function UonImageCard({ caption = "University of Nottingham" }: UonImageCardProps) {
  return (
    <figure className="uon-card">
      <Image
        src={UON_IMAGE_URL}
        alt="University of Nottingham campus building"
        width={1600}
        height={900}
        loading="lazy"
      />
      <figcaption>
        {caption}. Image source: <a href={UON_IMAGE_SOURCE}>Wikimedia Commons</a>.
      </figcaption>
    </figure>
  );
}
