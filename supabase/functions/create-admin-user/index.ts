import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-ADMIN] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Use the service role key to create users and assign roles
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { email, password } = await req.json();

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    logStep("Creating admin user", { email });

    // Create the user with admin privileges
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'admin'
      }
    });

    if (userError) {
      throw new Error(`Failed to create user: ${userError.message}`);
    }

    if (!userData.user) {
      throw new Error("User creation failed - no user data returned");
    }

    logStep("User created successfully", { userId: userData.user.id });

    // Assign admin role to the user
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userData.user.id,
        role: 'admin'
      });

    if (roleError) {
      logStep("Warning: Failed to assign admin role", { error: roleError.message });
      // Don't throw here as the user was created successfully
    } else {
      logStep("Admin role assigned successfully");
    }

    // Also create a subscriber record with unlimited access
    const { error: subscriberError } = await supabaseAdmin
      .from('subscribers')
      .insert({
        user_id: userData.user.id,
        email: userData.user.email,
        subscribed: true,
        subscription_tier: 'equipes',
        stripe_customer_id: null,
        subscription_end: null, // No expiration for admin
      });

    if (subscriberError) {
      logStep("Warning: Failed to create subscriber record", { error: subscriberError.message });
    } else {
      logStep("Subscriber record created successfully");
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: userData.user.id,
        email: userData.user.email,
        role: 'admin'
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-admin-user", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});