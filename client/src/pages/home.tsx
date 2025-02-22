import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Upload, AlertCircle, FileText, TrendingUp, Target, Lightbulb, Brain } from "lucide-react";
import { analyzeTranscript } from "@/lib/api";
import type { Transcript } from "@shared/schema";
import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  const { toast } = useToast();
  const [result, setResult] = useState<Transcript | null>(null);
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');

  const mutation = useMutation({
    mutationFn: (file: File) => analyzeTranscript(file, provider),
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
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 py-12">
      <motion.div 
        className="container mx-auto px-4 max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.h1 
          className="text-6xl font-black text-center mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
          variants={itemVariants}
        >
          Earnings Insight AI
        </motion.h1>

        <motion.p 
          className="text-center text-muted-foreground mb-8 text-lg"
          variants={itemVariants}
        >
          Transform earnings transcripts into actionable insights with AI
        </motion.p>

        <motion.div variants={itemVariants}>
          <Card className="mb-8 overflow-hidden border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                Choose AI Provider
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <RadioGroup
                value={provider}
                onValueChange={(value: 'gemini' | 'openai') => setProvider(value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gemini" id="gemini" />
                  <Label htmlFor="gemini" className="font-medium">Gemini</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="openai" id="openai" />
                  <Label htmlFor="openai" className="font-medium">OpenAI</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="pt-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
                  ${
                    isDragActive
                      ? "border-primary bg-primary/5 scale-[0.99] shadow-inner"
                      : "border-gray-300 hover:border-primary hover:bg-primary/5"
                  }`}
              >
                <input {...getInputProps()} />
                <Upload className={`mx-auto h-20 w-20 transition-colors duration-300 ${
                  isDragActive ? "text-primary" : "text-primary/60"
                }`} />
                <h3 className="text-2xl font-bold mt-4 mb-2">
                  {isDragActive ? "Drop to analyze" : "Upload Transcript"}
                </h3>
                <p className="text-muted-foreground text-lg">
                  Drag & drop your earnings transcript
                </p>
                <p className="text-sm text-muted-foreground/70 mt-2">
                  Supports TXT, PDF, DOC, DOCX (max 5MB)
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {mutation.isPending && (
          <motion.div variants={itemVariants}>
            <Card className="shadow-lg">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary animate-pulse" />
                  Analyzing Transcript...
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
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
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
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
                      <p className="text-3xl font-bold text-primary">
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
                      <p className="text-3xl font-bold text-primary">{result.analysis.eps}</p>
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

            <motion.div variants={itemVariants}>
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="border-b bg-primary/5">
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Key Themes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="grid gap-4">
                    {result.analysis.keyThemes.map((theme, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-start gap-3"
                      >
                        <Target className="h-5 w-5 text-primary shrink-0 mt-1" />
                        <span className="text-lg">{theme}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {result.analysis.futureOutlook && (
              <motion.div variants={itemVariants}>
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="border-b bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Future Outlook
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {result.analysis.futureOutlook}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}

        {mutation.isError && (
          <motion.div variants={itemVariants}>
            <Alert variant="destructive" className="animate-shake">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{mutation.error.message}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}