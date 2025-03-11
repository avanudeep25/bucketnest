
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { popularTags } from "@/constants/wishlistFormOptions";
import { FormItem, FormLabel } from "@/components/ui/form";

interface TagsManagerProps {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
}

const TagsManager = ({ selectedTags, setSelectedTags }: TagsManagerProps) => {
  const [customTag, setCustomTag] = useState("");

  const addTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags([...selectedTags, customTag.trim()]);
      setCustomTag("");
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <FormItem>
      <FormLabel>Tags/Mood</FormLabel>
      <div className="flex flex-wrap gap-2 mb-2">
        {popularTags.map((tag) => (
          <Badge
            key={tag}
            className={cn(
              "cursor-pointer",
              selectedTags.includes(tag)
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Add a custom tag"
          value={customTag}
          onChange={(e) => setCustomTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          className="flex-1"
        />
        <Button type="button" onClick={addTag} variant="outline">
          Add
        </Button>
      </div>
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedTags.filter(tag => !popularTags.includes(tag)).map((tag) => (
            <Badge key={tag} className="gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
              {tag}
              <XIcon
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleTag(tag)}
              />
            </Badge>
          ))}
        </div>
      )}
    </FormItem>
  );
};

export default TagsManager;
