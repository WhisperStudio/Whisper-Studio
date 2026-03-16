import React from "react";
import "./IMG_gallery.css";

import placeholderImage2 from "../../../bilder/smart_gnome.png";
import placeholderImage4 from "../../../bilder/assets_task_01jqzwt0nqf4ttddc4ykksgj87_img_0.webp";
import placeholderImage5 from "../../../bilder/assets_task_01jqzyj308f1s8ph7d3pz8fy24_img_0.webp";
import placeholderImage6 from "../../../bilder/assets_task_01jqebmy91fw3r80bh65pceeam_img_1.webp";
import placeholderImage9 from "../../../bilder/Nøkken.png";
import placeholderImage10 from "../../../bilder/Troll.png";
import placeholderImage12 from "../../../bilder/Pesta.png";

const CREATURES = [
  { id: 1, img: placeholderImage2, title: "Nisse", sub: "Friendly", tags: ["gnome", "friendly", "folk"] },
  { id: 2, img: placeholderImage4, title: "Forest Dweller", sub: "Unfriendly", tags: ["forest", "dark"] },
  { id: 3, img: placeholderImage6, title: "Shadow", sub: "Unfriendly", tags: ["shadow", "mystic"] },
  { id: 4, img: placeholderImage5, title: "Huldra", sub: "Unfriendly", tags: ["folk", "myth"] },
  { id: 12, img: placeholderImage9, title: "Nøkken", sub: "Unfriendly", tags: ["water", "monster"] },
  { id: 13, img: placeholderImage10, title: "Troll", sub: "Unfriendly", tags: ["troll", "rock"] },
  { id: 14, img: placeholderImage12, title: "Pesta", sub: "Unfriendly", tags: ["plague", "dark"] },
];


export { CREATURES };
export default function Gallery() {

  return (
    <div className="creature-flex">
    <div className="creature-grid">
        {CREATURES.map((creature) => (
          <div
            key={creature.id}
            className="creature-card"
          >
            <img src={creature.img} alt={creature.title} />
           
          </div>
          
          
        ))}
    </div>
    <div className="creature-grid">
         {CREATURES.map((creature) => (
            <div key={creature.id}>
              <h3 className="creature-title">{creature.title}</h3>
              <span className={`sub-tag ${creature.sub.toLowerCase()}`}>
                {creature.sub}
              </span>
            </div>
          ))}
    </div>
    </div>
  );
}
