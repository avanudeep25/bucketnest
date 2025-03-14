import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Share2, FolderHeart, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";

const Index = () => {
  const { currentUser } = useUserStore();
  const [userName, setUserName] = useState("");
  const [isAuthReady, setIsAuthReady] = useState(false);
  const navigate = useNavigate();
  
  // This effect runs only once when component mounts
  useEffect(() => {
    // First check localStorage for cached username
    const cachedUserName = localStorage.getItem('bucketNestUserName');
    
    if (cachedUserName) {
      setUserName(cachedUserName);
    }
    
    setIsAuthReady(true);
  }, []); // Empty dependency array means it runs once on mount
  
  // This effect monitors changes to currentUser
  useEffect(() => {
    if (currentUser) {
      // If we have a currentUser with a name, update and cache it
      if (currentUser.name) {
        setUserName(currentUser.name);
        localStorage.setItem('bucketNestUserName', currentUser.name);
      }
    } else if (currentUser === null) {
      // Only clear if user explicitly logs out (null vs undefined)
      localStorage.removeItem('bucketNestUserName');
      setUserName("");
    }
  }, [currentUser]);

  // Rest of your component code remains the same...



