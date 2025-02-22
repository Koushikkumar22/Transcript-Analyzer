import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Upload, AlertCircle, FileText, TrendingUp, Target, Lightbulb } from "lucide-react";
import { analyzeTranscript } from "@/lib/api";
import type { Transcript } from "@shared/schema";
import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function Home() {
  const { toast } = useToast();
  const [result, setResult] = useState<Transcript | null>(null);

  const mutation = useMutation({
    mutationFn: analyzeTranscript,
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Analysis Complete",
        description: "The transcript has been successfully analyzed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "text/*": [".txt"],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        mutation.mutate(acceptedFiles[0]);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.h1 
          className="text-5xl font-extrabold text-center mb-6 bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent"
          {...fadeIn}
        >
          Earnings Insight AI
        </motion.h1>
        <motion.p 
          className="text-center text-muted-foreground mb-12 text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Upload your earnings transcript and get instant AI-powered analysis
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="mb-8 shadow-lg">
            <CardContent className="pt-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
                  ${
                    isDragActive
                      ? "border-primary/70 bg-primary/5 scale-[0.99]"
                      : "border-gray-300 hover:border-primary hover:bg-primary/5"
                  }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-16 w-16 text-primary/60 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {isDragActive ? "Drop the file here" : "Upload Earnings Transcript"}
                </h3>
                <p className="text-muted-foreground">
                  Drag & drop a transcript file, or click to browse
                </p>
                <p className="text-sm text-muted-foreground/70 mt-2">
                  Supported format: .txt (max 5MB)
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {mutation.isPending && (
          <motion.div {...fadeIn}>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Analyzing Transcript...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {result?.analysis && (
          <div className="space-y-6">
            <motion.div {...fadeIn}>
              <Card className="shadow-md overflow-hidden">
                <CardHeader className="border-b bg-primary/5">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Financial Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 pt-6">
                  {result.analysis.revenue && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Revenue</h3>
                      <p className="text-2xl font-bold text-primary">
                        {result.analysis.revenue.amount}
                      </p>
                      {result.analysis.revenue.growth && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          Growth: {result.analysis.revenue.growth}
                        </p>
                      )}
                    </div>
                  )}
                  {result.analysis.eps && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Earnings Per Share</h3>
                      <p className="text-2xl font-bold text-primary">{result.analysis.eps}</p>
                    </div>
                  )}
                  {result.analysis.guidance && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Next Quarter Guidance</h3>
                      <p className="text-muted-foreground">{result.analysis.guidance}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              {...fadeIn}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-md">
                <CardHeader className="border-b bg-primary/5">
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Key Themes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="grid gap-3">
                    {result.analysis.keyThemes.map((theme, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-start gap-2"
                      >
                        <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{theme}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {result.analysis.futureOutlook && (
              <motion.div 
                {...fadeIn}
                transition={{ delay: 0.3 }}
              >
                <Card className="shadow-md">
                  <CardHeader className="border-b bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Future Outlook
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {result.analysis.futureOutlook}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}

        {mutation.isError && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{mutation.error.message}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </div>
    </div>
  );
}