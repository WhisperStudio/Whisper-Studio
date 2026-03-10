import React, { useState, useRef, useLayoutEffect } from "react";
import S_Header from "./S_Header";
import "./ShowRoom.css";
import RootTreeOverlay from "./RootTreeOverlay";

import placeholderImage1 from "../../../bilder/assets_task_01jr7m94hseeqad46rhaa8vhrq_img_0.webp";
import placeholderImage2 from "../../../bilder/smart_gnome.png";
import placeholderImage3 from "../../../images/siu.png";
import placeholderImage4 from "../../../bilder/assets_task_01jqzwt0nqf4ttddc4ykksgj87_img_0.webp";
import placeholderImage5 from "../../../bilder/assets_task_01jqzyj308f1s8ph7d3pz8fy24_img_0.webp";
import placeholderImage6 from "../../../bilder/assets_task_01jqebmy91fw3r80bh65pceeam_img_1.webp";
import placeholderImage7 from "../../../bilder/GnomeSitting.png";
import placeholderImage8 from "../../../bilder/Villiage.png";
import placeholderImage9 from "../../../bilder/Nøkken.png";
import placeholderImage10 from "../../../bilder/Troll.png";
import placeholderImage11 from "../../../bilder/HorseAndGirl.png";
import placeholderImage12 from "../../../bilder/Pesta.png";

const CREATURES = [
  { id: 1, img: placeholderImage2, title: "Nisse", sub: "Friendly", tags: ["gnome","friendly","folk"] },
  { id: 2, img: placeholderImage4, title: "Forest Dweller", sub: "Unfriendly", tags: ["forest","dark"] },
  { id: 3, img: placeholderImage6, title: "Shadow", sub: "Unfriendly", tags: ["shadow","mystic"] },
  { id: 4, img: placeholderImage5, title: "Huldra", sub: "Unfriendly", tags: ["folk","myth"] },
  { id: 12, img: placeholderImage9, title: "Nøkken", sub: "Unfriendly", tags: ["water","monster"] },
  { id: 13, img: placeholderImage10, title: "Troll", sub: "Unfriendly", tags: ["troll","rock"] },
  { id: 14, img: placeholderImage12, title: "Pesta", sub: "Unfriendly", tags: ["plague","dark"] },
];

export default function ShowRoom() {
  const [selectedCreature, setSelectedCreature] = useState(null);
  const [treeHeight, setTreeHeight] = useState(2200);
  const showroomRef = useRef(null);

  useLayoutEffect(() => {
    if (!showroomRef.current) return;

    const measure = () => {
      const h = showroomRef.current.offsetHeight;
      setTreeHeight(h);
    };

    measure();

    const ro = new ResizeObserver(() => {
      measure();
    });

    ro.observe(showroomRef.current);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div className="showroom showroom--with-tree" ref={showroomRef}>
      <S_Header />

      <div className="showroom-tree-layer">
        <RootTreeOverlay
          height={treeHeight}
          width={420}
          trunkX={220}
          opacity={0.95}
        />
      </div>

      <div className="creature-grid">
        {CREATURES.map((creature) => (
          <div
            key={creature.id}
            className="creature-card"
            onClick={() => setSelectedCreature(creature)}
          >
            <img src={creature.img} alt={creature.title} />
            <h3>{creature.title}</h3>
            <span className={`sub-tag ${creature.sub.toLowerCase()}`}>
              {creature.sub}
            </span>
          </div>
        ))}
      </div>

      {selectedCreature && (
        <div className="creature-modal" onClick={() => setSelectedCreature(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedCreature(null)}>
              ×
            </button>
            <img src={selectedCreature.img} alt={selectedCreature.title} />
            <h2>{selectedCreature.title}</h2>
            <span className={`sub-tag ${selectedCreature.sub.toLowerCase()}`}>
              {selectedCreature.sub}
            </span>
            <div className="tags">
              {selectedCreature.tags.map((tag, idx) => (
                <span key={idx} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}