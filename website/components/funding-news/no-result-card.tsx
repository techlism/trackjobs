import { XCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export default function NoResultsCard({ onReset }: { onReset: () => void }) {
    return (
        <Card className="w-full">
            <CardContent className="p-6">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <XCircle className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold mb-2">No Results Found</h2>
                        <p className="text-muted-foreground mb-4">
                            No companies match your current filter criteria. Try adjusting your filters or perform a new search.
                        </p>
                    </div>
                    <div className="flex justify-center gap-4">
                        <Button variant="outline" onClick={onReset}>
                            Reset All Filters
                        </Button>
                        <Button
                            variant="default"
                            onClick={() => window.history.back()}
                        >
                            Go Back
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}