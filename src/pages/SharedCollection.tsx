import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSharingStore } from "@/store/sharingStore";
import { useAuth } from "@/auth/AuthContext"; // Add auth context
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Tag, 
  ExternalLink, 
  DollarSign, 
  Users,
  Share2, // Add share icon
  Check // Add check icon for confirmation
} from "lucide-react";
